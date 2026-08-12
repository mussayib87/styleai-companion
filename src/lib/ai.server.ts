/**
 * AI provider boundary. Everything model-specific lives here, so the provider
 * can be swapped without touching product code.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

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

async function chat(
  messages: unknown[],
  opts: { json?: boolean } = {},
): Promise<string> {
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
  productUrl?: string;
  notes?: string;
  imageDataUrl?: string;
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
