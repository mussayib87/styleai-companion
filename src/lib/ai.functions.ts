import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MAX_STYLE_PROFILE_IMAGE_LENGTH = 10 * 1024 * 1024;
const imageDataUrl = z
  .string()
  .min(32)
  .max(MAX_STYLE_PROFILE_IMAGE_LENGTH, "Image is too large")
  .refine((value) => /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value), {
    message: "Expected a base64 image data URL",
  });

export const analyzeStyleProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ imageDataUrl }).parse(d))
  .handler(async ({ data }) => {
    const { analyzeStyleProfile } = await import("./ai.server");
    return analyzeStyleProfile(data.imageDataUrl);
  });

export const analyzeClothingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ imageDataUrl: z.string().min(16) }).parse(d))
  .handler(async ({ data }) => {
    const { analyzeClothingImage } = await import("./ai.server");
    return analyzeClothingImage(data.imageDataUrl);
  });

export const stylistChatFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        question: z.string().min(1),
        wardrobeSummary: z.string().default(""),
        profileSummary: z.string().default(""),
        planSummary: z.string().default(""),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { chatWithStylist } = await import("./ai.server");
    return chatWithStylist(data);
  });

export const analyzeProductFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        productName: z.string().min(1),
        productUrl: z.string().optional(),
        notes: z.string().optional(),
        imageDataUrl: z.string().optional(),
        wardrobeSummary: z.string().default(""),
        profileSummary: z.string().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { analyzeShoppingProduct } = await import("./ai.server");
    return analyzeShoppingProduct(data);
  });

export const tryOnFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        personImageDataUrl: z.string().min(16),
        outfitDescription: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { generateTryOn } = await import("./ai.server");
    return generateTryOn(data);
  });
