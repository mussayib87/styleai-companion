import { getAiPickVisual } from "./ai-pick-visuals";
import type { WardrobeItem } from "./types";

function text(item: Pick<WardrobeItem, "category" | "name" | "style">): string {
  return `${item.category} ${item.name} ${item.style}`.trim().toLowerCase();
}

export function matchesClothingFilter(item: WardrobeItem, filter: string): boolean {
  if (filter === "All") return true;
  const value = text(item);
  const normalized = filter.trim().toLowerCase();
  const itemCategory = item.category.trim().toLowerCase();
  if (
    itemCategory === normalized ||
    itemCategory.replace(/s$/, "") === normalized.replace(/s$/, "")
  ) {
    return true;
  }
  if (["party", "casual", "formal"].includes(normalized)) {
    return value.includes(normalized) || (normalized === "formal" && item.formality >= 4);
  }
  return false;
}

export function itemImageKey(
  item: Pick<WardrobeItem, "id" | "image_url" | "category" | "name">,
): string | null {
  if (item.image_url?.trim()) return `url:${item.image_url.trim()}`;
  const visual = getAiPickVisual(item);
  return visual ? `url:${visual.imageUrl}` : `item:${item.id}`;
}

const OCCASION_TERMS: Record<string, string[]> = {
  College: ["casual", "minimal", "streetwear", "trendy", "simple", "smart casual"],
  School: ["casual", "minimal", "simple"],
  Party: ["party", "trendy", "streetwear", "formal", "smart casual"],
  Outdoor: ["casual", "streetwear", "trendy", "simple"],
  Wedding: ["formal", "classic", "smart casual"],
  Marriage: ["formal", "classic", "smart casual"],
  Office: ["formal", "classic", "smart casual", "minimal"],
  Interview: ["formal", "classic", "smart casual"],
  Casual: ["casual", "minimal", "streetwear", "trendy", "simple"],
  Travel: ["casual", "minimal", "streetwear", "simple"],
  Partywear: ["party", "trendy", "formal"],
  Festival: ["trendy", "casual", "classic", "formal"],
  Sports: ["casual", "streetwear"],
  Date: ["trendy", "smart casual", "classic", "casual"],
  "Date/event": ["trendy", "smart casual", "classic", "formal"],
};

export function isAppropriateForOccasion(item: WardrobeItem, occasion: string): boolean {
  const normalized = occasion.trim().toLowerCase();
  const value = text(item);
  const terms = Object.entries(OCCASION_TERMS).find(
    ([key]) => key.toLowerCase() === normalized,
  )?.[1];
  if (terms?.some((term) => value.includes(term))) return true;

  const formal = item.formality >= 3;
  if (["wedding", "marriage", "office", "interview", "formal"].includes(normalized)) return formal;
  if (["school", "college", "casual", "outdoor", "travel", "sports"].includes(normalized)) {
    return item.formality <= 2;
  }
  if (normalized === "party") {
  return (
    value.includes("party") ||
    value.includes("trendy") ||
    value.includes("streetwear")
  );
}

if (normalized === "casual") {
  return (
    value.includes("casual") ||
    value.includes("minimal") ||
    value.includes("streetwear")
  );
}

if (normalized === "formal") {
  return (
    value.includes("formal") ||
    value.includes("classic") ||
    item.formality >= 4
  );
}
  return true;
}

export function filterForOccasion(items: WardrobeItem[], occasion: string): WardrobeItem[] {
  const filtered = items.filter((item) => isAppropriateForOccasion(item, occasion));
  return filtered;
}
