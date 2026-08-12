import {
  analyzeClothingFn,
  analyzeProductFn,
  stylistChatFn,
  tryOnFn,
} from "@/lib/ai.functions";
import { generateOutfits, planWeek, type StylistContext } from "./engine";
import type { WardrobeItem } from "./types";

/**
 * AIService — single boundary between the product and any AI provider.
 * Ranking/planning are local and always available; language + vision calls go
 * through server functions so keys never reach the browser.
 */
export const AIService = {
  async analyzeClothingImage(imageDataUrl: string) {
    return analyzeClothingFn({ data: { imageDataUrl } });
  },

  generateOutfits(wardrobe: WardrobeItem[], ctx: StylistContext, limit = 5) {
    return generateOutfits(wardrobe, ctx, limit);
  },

  rankOutfits(wardrobe: WardrobeItem[], ctx: StylistContext, limit = 5) {
    return generateOutfits(wardrobe, ctx, limit);
  },

  planWeek,

  async chatWithStylist(input: {
    question: string;
    wardrobeSummary: string;
    profileSummary: string;
    planSummary: string;
    history: { role: "user" | "assistant"; content: string }[];
  }) {
    return stylistChatFn({ data: input });
  },

  async analyzeShoppingProduct(input: {
    productName: string;
    productUrl?: string;
    notes?: string;
    imageDataUrl?: string;
    wardrobeSummary: string;
    profileSummary: string;
  }) {
    return analyzeProductFn({ data: input });
  },

  async generateTryOn(input: { personImageDataUrl: string; outfitDescription: string }) {
    return tryOnFn({ data: input });
  },
};

export function summarizeWardrobe(items: WardrobeItem[]): string {
  if (!items.length) return "empty wardrobe";
  return items
    .map(
      (i) =>
        `${i.name} (${i.category}, ${i.color}, ${i.style}${i.in_laundry ? ", IN LAUNDRY" : ""})`,
    )
    .join("; ");
}
