import { Type } from "@google/genai";
import type { StyleProfile } from "./styleai/types";

/**
 * AI provider boundary. Everything model-specific lives here, so the provider
 * can be swapped without touching product code.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";
const STYLE_PROFILE_TIMEOUT_MS = 30_000;
const GEMINI_REQUEST_TIMEOUT_MS = 10_000;

export type ClothingAnalysis = {
  name: string;
  category: string;
  color: string;
  pattern: string;
  style: string;
  fit: string;
  sleeve: string | null;
  formality: number;
  confidence: "low" | "medium" | "high";
};

function key(): string | undefined {
  return process.env["LOVABLE_API_KEY"];
}

function geminiKey(): string | undefined {
  return process.env["GEMINI_API_KEY"];
}

function normalizeGeminiError(error: unknown): Error {
  const markerStatus = error instanceof Error && error.message.match(/^GEMINI_HTTP_(\d+)$/)?.[1];
  if (markerStatus) {
    return normalizeGeminiError({ status: Number(markerStatus) });
  }
  if (error instanceof Error && error.message.startsWith("GEMINI_")) return error;

  const status =
    error && typeof error === "object" && "status" in error && typeof error.status === "number"
      ? error.status
      : undefined;
  if (status === 503) return new Error("GEMINI_OVERLOADED");
  if (status === 429) return new Error("GEMINI_RATE_LIMITED");
  if (status === 400) return new Error("GEMINI_BAD_REQUEST");
  if (status === 401 || status === 403) return new Error("GEMINI_AUTH_ERROR");
  return new Error("GEMINI_REQUEST_FAILED");
}

function geminiStatus(error: unknown): number | undefined {
  return error && typeof error === "object" && "status" in error && typeof error.status === "number"
    ? error.status
    : undefined;
}

const STYLE_PROFILE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    face: { type: Type.OBJECT, properties: { shape: { type: Type.STRING } }, required: ["shape"] },
    hair: {
      type: Type.OBJECT,
      properties: { description: { type: Type.STRING } },
      required: ["description"],
    },
    silhouette: {
      type: Type.OBJECT,
      properties: { description: { type: Type.STRING } },
      required: ["description"],
    },
    best_colors: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_fits: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_silhouettes: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_styles: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          item: { type: Type.STRING },
          color: { type: Type.STRING },
          fit: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["category", "item", "color", "fit", "reason"],
      },
    },
  },
  required: [
    "summary",
    "face",
    "hair",
    "silhouette",
    "best_colors",
    "recommended_fits",
    "recommended_silhouettes",
    "recommended_styles",
    "recommended_items",
  ],
} as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStyleProfile(value: unknown): value is StyleProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  const face = profile.face as Record<string, unknown> | null;
  const hair = profile.hair as Record<string, unknown> | null;
  const silhouette = profile.silhouette as Record<string, unknown> | null;
  const items = profile.recommended_items;
  return (
    typeof profile.summary === "string" &&
    !!face &&
    typeof face.shape === "string" &&
    !!hair &&
    typeof hair.description === "string" &&
    !!silhouette &&
    typeof silhouette.description === "string" &&
    isStringArray(profile.best_colors) &&
    isStringArray(profile.recommended_fits) &&
    isStringArray(profile.recommended_silhouettes) &&
    isStringArray(profile.recommended_styles) &&
    Array.isArray(items) &&
    items.every((item) => {
      if (!item || typeof item !== "object") return false;
      const recommendation = item as Record<string, unknown>;
      return ["category", "item", "color", "fit", "reason"].every(
        (key) => typeof recommendation[key] === "string",
      );
    })
  );
}

export async function analyzeStyleProfile(imageDataUrl: string): Promise<StyleProfile> {
  const apiKey = geminiKey();
  if (!apiKey) throw new Error("GEMINI_NOT_CONFIGURED");
  const match = imageDataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/);
  if (!match) throw new Error("INVALID_IMAGE");

  try {
    const requestStartedAt = Date.now();
    if (process.env["NODE_ENV"] !== "production") {
      console.info(
        `[StyleAI] style profile image payload: ${(imageDataUrl.length / 1024 / 1024).toFixed(2)} MB`,
      );
    }
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are StyleAI's personal fashion stylist. Analyze this uploaded image for clothing and style recommendations and return ONLY the requested structured JSON.

Focus on visible face shape where reasonably observable, visible hair characteristics, general clothing-relevant silhouette and proportions, current visible clothing and style, flattering colors, suitable fits, suitable silhouettes, suitable fashion styles, and concrete clothing items to shop for.

Use wording such as "appears" or "suggests" where certainty is limited. Analyze only visible characteristics useful for clothing recommendations. Do not identify the person. Do not infer race, ethnicity, religion, medical conditions, health status, or other sensitive characteristics. Do not provide exact body measurements. Keep the result respectful and non-judgmental.`,
            },
            {
              inlineData: {
                mimeType: `image/${match[1] === "jpg" ? "jpeg" : match[1]}`,
                data: imageDataUrl.slice(match[0].length),
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: STYLE_PROFILE_SCHEMA,
        thinkingConfig: { thinkingLevel: "low" },
      },
    };
    const request = new AbortController();
    const requestTimeout = setTimeout(() => request.abort(), GEMINI_REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: request.signal,
        },
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw new Error("GEMINI_TIMEOUT");
      throw new Error("GEMINI_REQUEST_FAILED");
    } finally {
      clearTimeout(requestTimeout);
      if (process.env["NODE_ENV"] !== "production") {
        console.info(
          `[StyleAI] style profile Gemini duration: ${Date.now() - requestStartedAt} ms`,
        );
      }
    }
    const responseBody = (await response.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { status?: string; message?: string };
    } | null;
    if (!response.ok) {
      if (process.env["NODE_ENV"] !== "production") {
        console.info(
          `[StyleAI] style profile Gemini HTTP ${response.status} ${responseBody?.error?.status ?? "UNKNOWN"}: ${responseBody?.error?.message ?? "request failed"}`,
        );
      }
      const error = new Error(`GEMINI_HTTP_${response.status}`) as Error & { status: number };
      error.status = response.status;
      throw error;
    }
    const raw = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("GEMINI_MALFORMED_RESPONSE");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("GEMINI_MALFORMED_RESPONSE");
    }
    if (!isStyleProfile(parsed)) throw new Error("GEMINI_MALFORMED_RESPONSE");
    return parsed;
  } catch (error) {
    throw normalizeGeminiError(error);
  }
}

async function chat(messages: unknown[], opts: { json?: boolean } = {}): Promise<string> {
  const apiKey = key();
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI_RATE_LIMITED");
    if (res.status === 402) throw new Error("AI_CREDITS");
    throw new Error(`AI_ERROR:${res.status}:${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

const CATEGORY_LIST =
  "Shirts, T-Shirts, Pants, Jeans, Trousers, Shoes, Jackets, Dresses, Accessories, Other";

export async function analyzeClothingImage(
  imageDataUrl: string,
): Promise<ClothingAnalysis & { mocked?: boolean }> {
  if (!key()) return { ...mockAnalysis(), mocked: true };
  const raw = await chat(
    [
      {
        role: "system",
        content:
          "You identify clothing garments for a digital wardrobe. Describe only the garment, never the person, never appearance or body judgements. Reply with JSON only.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Identify this garment. JSON keys: name (short label), category (one of: ${CATEGORY_LIST}), color, pattern (solid|striped|checked|printed|textured), style (Minimal|Casual|Smart Casual|Formal|Streetwear|Trendy|Classic|Simple), fit (loose|regular|fitted), sleeve (full|short|null), formality (1-4), confidence (low|medium|high).`,
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    { json: true },
  );
  const parsed = parseJson<ClothingAnalysis>(raw);
  if (!parsed) return { ...mockAnalysis(), mocked: true };
  return {
    name: parsed.name || "New item",
    category: parsed.category || "Other",
    color: parsed.color || "Neutral",
    pattern: parsed.pattern || "solid",
    style: parsed.style || "Casual",
    fit: parsed.fit || "regular",
    sleeve: parsed.sleeve ?? null,
    formality: Number(parsed.formality) || 2,
    confidence: parsed.confidence || "medium",
  };
}

function mockAnalysis(): ClothingAnalysis {
  return {
    name: "White Shirt",
    category: "Shirts",
    color: "White",
    pattern: "solid",
    style: "Casual",
    fit: "regular",
    sleeve: "full",
    formality: 3,
    confidence: "low",
  };
}

export type StylistReply = { message: string; mocked?: boolean };

export async function chatWithStylist(input: {
  question: string;
  wardrobeSummary: string;
  profileSummary: string;
  planSummary: string;
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<StylistReply> {
  if (!key()) {
    return {
      message:
        "Demo mode: AI replies are simulated right now, but your wardrobe engine is live. Try “Style Me” on the home screen — those outfits are generated from your real wardrobe.",
      mocked: true,
    };
  }
  const message = await chat([
    {
      role: "system",
      content: `You are StyleAI, a personal stylist that only recommends from the user's own wardrobe.
Never comment on the user's body or attractiveness. Be concise, warm, practical.
Refer to real item names. If something is unavailable (laundry) say so.

USER PROFILE: ${input.profileSummary}
WARDROBE: ${input.wardrobeSummary}
THIS WEEK'S PLAN: ${input.planSummary}`,
    },
    ...input.history.slice(-8),
    { role: "user", content: input.question },
  ]);
  return { message: message || "I couldn't put that look together. Try asking again." };
}

export type ShoppingAnalysis = {
  product_name: string;
  category: string;
  color: string;
  compatibility: "High" | "Medium" | "Low";
  overlap: "High" | "Medium" | "Low";
  style_compatibility: "High" | "Medium" | "Low";
  new_combinations: number;
  occasions: string[];
  reasons: string[];
  concerns: string[];
  pairings: string[];
  mocked?: boolean;
};

export async function analyzeShoppingProduct(input: {
  productName: string;
  productUrl?: string | undefined;
  notes?: string | undefined;
  imageDataUrl?: string | undefined;
  wardrobeSummary: string;
  profileSummary: string;
}): Promise<ShoppingAnalysis> {
  if (!key()) return { ...mockShopping(input.productName), mocked: true };
  const content: unknown[] = [
    {
      type: "text",
      text: `Decide whether this product fits the user's existing wardrobe. JSON keys: product_name, category, color, compatibility (High|Medium|Low), overlap (High|Medium|Low), style_compatibility (High|Medium|Low), new_combinations (integer estimate), occasions (array), reasons (array of short strings), concerns (array of short strings), pairings (array of existing wardrobe item names).
Product: ${input.productName}
URL: ${input.productUrl ?? "n/a"}
Notes: ${input.notes ?? "n/a"}
WARDROBE: ${input.wardrobeSummary}
PROFILE: ${input.profileSummary}
Never promise the user will look good; focus on wardrobe compatibility.`,
    },
  ];
  if (input.imageDataUrl)
    content.push({ type: "image_url", image_url: { url: input.imageDataUrl } });

  const raw = await chat(
    [
      {
        role: "system",
        content:
          "You are StyleAI's shopping assistant. You compare a candidate product against the user's real wardrobe. JSON only.",
      },
      { role: "user", content },
    ],
    { json: true },
  );
  const parsed = parseJson<ShoppingAnalysis>(raw);
  if (!parsed) return { ...mockShopping(input.productName), mocked: true };
  return {
    product_name: parsed.product_name || input.productName,
    category: parsed.category || "Other",
    color: parsed.color || "Neutral",
    compatibility: parsed.compatibility || "Medium",
    overlap: parsed.overlap || "Low",
    style_compatibility: parsed.style_compatibility || "Medium",
    new_combinations: Number(parsed.new_combinations) || 0,
    occasions: parsed.occasions ?? [],
    reasons: parsed.reasons ?? [],
    concerns: parsed.concerns ?? [],
    pairings: parsed.pairings ?? [],
  };
}

function mockShopping(name: string): ShoppingAnalysis {
  return {
    product_name: name || "Product",
    category: "Shirts",
    color: "Black",
    compatibility: "High",
    overlap: "Low",
    style_compatibility: "High",
    new_combinations: 6,
    occasions: ["College", "Casual", "Party"],
    reasons: [
      "Works with several items you already own",
      "Matches your preferred style",
      "Adds new outfit combinations",
    ],
    concerns: ["You may already own something similar in a close colour"],
    pairings: ["Dark Blue Jeans", "Beige Chinos", "Black Slim Jeans", "White Sneakers"],
  };
}

export type TryOnResult = { imageDataUrl: string | null; mocked?: boolean; note: string };

export async function generateTryOn(input: {
  personImageDataUrl: string;
  outfitDescription: string;
}): Promise<TryOnResult> {
  const apiKey = key();
  const note = "AI-generated preview — actual fit and appearance may vary.";
  if (!apiKey) return { imageDataUrl: null, mocked: true, note };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Re-dress the person in this photo in the following outfit, preserving their face, identity, pose and body exactly as-is. Only change the clothing. Outfit: ${input.outfitDescription}. Neutral studio background, natural lighting, full-body framing.`,
            },
            { type: "image_url", image_url: { url: input.personImageDataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("AI_RATE_LIMITED");
    if (res.status === 402) throw new Error("AI_CREDITS");
    throw new Error(`AI_ERROR:${res.status}`);
  }
  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) return { imageDataUrl: null, mocked: true, note };
  return { imageDataUrl: `data:image/png;base64,${b64}`, note };
}
