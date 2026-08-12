export type ItemRole = "top" | "bottom" | "shoes" | "outerwear" | "accessory";

export const CATEGORIES = [
  "Shirts",
  "T-Shirts",
  "Pants",
  "Jeans",
  "Trousers",
  "Shoes",
  "Jackets",
  "Dresses",
  "Accessories",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STYLES = [
  "Simple",
  "Minimal",
  "Trendy",
  "Casual",
  "Smart Casual",
  "Formal",
  "Streetwear",
  "Classic",
] as const;

export const FITS = ["loose", "regular", "fitted"] as const;

export const OCCASIONS = [
  "College",
  "Office",
  "Interview",
  "Casual",
  "Party",
  "Wedding",
  "Travel",
  "Date/event",
  "Daily wear",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const COLOR_OPTIONS = [
  "White",
  "Black",
  "Grey",
  "Navy",
  "Blue",
  "Beige",
  "Cream",
  "Brown",
  "Olive",
  "Green",
  "Maroon",
  "Pink",
  "Yellow",
  "Charcoal",
] as const;

export const PATTERNS = ["solid", "striped", "checked", "printed", "textured"] as const;

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  secondary_color: string | null;
  pattern: string;
  style: string;
  fit: string;
  sleeve: string | null;
  season: string;
  formality: number;
  image_url: string | null;
  in_laundry: boolean;
  times_worn: number;
  last_worn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GeneratedOutfit = {
  key: string;
  title: string;
  occasion: string;
  score: number;
  reasons: string[];
  pieces: { role: ItemRole; item: WardrobeItem }[];
};

export const ROLE_BY_CATEGORY: Record<string, ItemRole> = {
  Shirts: "top",
  "T-Shirts": "top",
  Dresses: "top",
  Pants: "bottom",
  Jeans: "bottom",
  Trousers: "bottom",
  Shoes: "shoes",
  Jackets: "outerwear",
  Accessories: "accessory",
  Other: "accessory",
};

export function roleOf(item: WardrobeItem): ItemRole {
  return ROLE_BY_CATEGORY[item.category] ?? "accessory";
}

/** Visual swatch colors for wardrobe items (no brand assets, no stock photos). */
const SWATCH: Record<string, [string, string]> = {
  white: ["#f7f7f5", "#dcdcd6"],
  cream: ["#f4ead9", "#ddcbb0"],
  beige: ["#e2d2ba", "#c3ab8c"],
  black: ["#2a2a2f", "#101014"],
  charcoal: ["#4a4d55", "#2c2f36"],
  grey: ["#a7abb3", "#75797f"],
  navy: ["#2c3b63", "#16223d"],
  blue: ["#4a76c4", "#2b4d8c"],
  olive: ["#7c8055", "#535737"],
  green: ["#4d7f5f", "#2f5540"],
  brown: ["#7d5a41", "#523725"],
  maroon: ["#733642", "#4a1f28"],
  pink: ["#e0a7b3", "#c07d8d"],
  yellow: ["#e6c96a", "#c5a542"],
};

export function swatchFor(color: string): [string, string] {
  return SWATCH[color.trim().toLowerCase()] ?? ["#6b6f7a", "#41454e"];
}
