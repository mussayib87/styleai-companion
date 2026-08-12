type Seed = {
  name: string;
  category: string;
  color: string;
  pattern?: string;
  style?: string;
  fit?: string;
  sleeve?: string | null;
  formality?: number;
  season?: string;
};

/** Realistic starter wardrobe: 10 shirts, 8 tees, 10 bottoms, 4 shoes, 2 jackets, 8 accessories. */
export const DEMO_WARDROBE: Seed[] = [
  { name: "White Oxford Shirt", category: "Shirts", color: "White", style: "Smart Casual", sleeve: "full", formality: 3 },
  { name: "Light Blue Shirt", category: "Shirts", color: "Blue", style: "Smart Casual", sleeve: "full", formality: 3 },
  { name: "Navy Formal Shirt", category: "Shirts", color: "Navy", style: "Formal", sleeve: "full", formality: 4 },
  { name: "Black Linen Shirt", category: "Shirts", color: "Black", style: "Minimal", sleeve: "full", formality: 3 },
  { name: "Checked Casual Shirt", category: "Shirts", color: "Blue", pattern: "checked", style: "Casual", sleeve: "full", formality: 2 },
  { name: "Beige Overshirt", category: "Shirts", color: "Beige", style: "Streetwear", sleeve: "full", fit: "loose", formality: 2 },
  { name: "Striped Summer Shirt", category: "Shirts", color: "White", pattern: "striped", style: "Casual", sleeve: "short", formality: 2, season: "summer" },
  { name: "Olive Utility Shirt", category: "Shirts", color: "Olive", style: "Casual", sleeve: "full", formality: 2 },
  { name: "Grey Flannel Shirt", category: "Shirts", color: "Grey", pattern: "checked", style: "Casual", sleeve: "full", formality: 2 },
  { name: "Cream Textured Shirt", category: "Shirts", color: "Cream", pattern: "textured", style: "Classic", sleeve: "full", formality: 3 },

  { name: "White Crew Tee", category: "T-Shirts", color: "White", style: "Minimal", sleeve: "short", formality: 1 },
  { name: "Black Oversized Tee", category: "T-Shirts", color: "Black", style: "Streetwear", sleeve: "short", fit: "loose", formality: 1 },
  { name: "Navy Polo", category: "T-Shirts", color: "Navy", style: "Smart Casual", sleeve: "short", formality: 2 },
  { name: "Olive Graphic Tee", category: "T-Shirts", color: "Olive", pattern: "printed", style: "Trendy", sleeve: "short", formality: 1 },
  { name: "Grey Melange Tee", category: "T-Shirts", color: "Grey", style: "Casual", sleeve: "short", formality: 1 },
  { name: "Maroon Henley", category: "T-Shirts", color: "Maroon", style: "Casual", sleeve: "full", formality: 2 },
  { name: "Green Relaxed Tee", category: "T-Shirts", color: "Green", style: "Casual", sleeve: "short", fit: "loose", formality: 1 },
  { name: "Cream Ribbed Tee", category: "T-Shirts", color: "Cream", style: "Minimal", sleeve: "short", formality: 1 },

  { name: "Dark Blue Jeans", category: "Jeans", color: "Navy", style: "Casual", formality: 2 },
  { name: "Black Slim Jeans", category: "Jeans", color: "Black", style: "Casual", fit: "fitted", formality: 2 },
  { name: "Light Wash Jeans", category: "Jeans", color: "Blue", style: "Trendy", formality: 2 },
  { name: "Grey Straight Jeans", category: "Jeans", color: "Grey", style: "Casual", formality: 2 },
  { name: "Beige Chinos", category: "Trousers", color: "Beige", style: "Smart Casual", formality: 3 },
  { name: "Charcoal Formal Trousers", category: "Trousers", color: "Charcoal", style: "Formal", formality: 4 },
  { name: "Navy Tailored Trousers", category: "Trousers", color: "Navy", style: "Formal", formality: 4 },
  { name: "Olive Cargo Pants", category: "Pants", color: "Olive", style: "Streetwear", fit: "loose", formality: 1 },
  { name: "Black Joggers", category: "Pants", color: "Black", style: "Casual", fit: "loose", formality: 1 },
  { name: "Cream Wide Pants", category: "Pants", color: "Cream", style: "Trendy", fit: "loose", formality: 2 },

  { name: "White Sneakers", category: "Shoes", color: "White", style: "Casual", formality: 2 },
  { name: "Black Sneakers", category: "Shoes", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Brown Leather Loafers", category: "Shoes", color: "Brown", style: "Classic", formality: 4 },
  { name: "Black Derby Shoes", category: "Shoes", color: "Black", style: "Formal", formality: 4 },

  { name: "Denim Jacket", category: "Jackets", color: "Blue", style: "Casual", formality: 2 },
  { name: "Charcoal Overcoat", category: "Jackets", color: "Charcoal", style: "Classic", formality: 4, season: "winter" },

  { name: "Silver Watch", category: "Accessories", color: "Grey", style: "Classic", formality: 3 },
  { name: "Black Leather Belt", category: "Accessories", color: "Black", style: "Classic", formality: 3 },
  { name: "Brown Woven Belt", category: "Accessories", color: "Brown", style: "Casual", formality: 2 },
  { name: "Black Cap", category: "Accessories", color: "Black", style: "Streetwear", formality: 1 },
  { name: "Beige Tote Bag", category: "Accessories", color: "Beige", style: "Minimal", formality: 2 },
  { name: "Round Sunglasses", category: "Accessories", color: "Black", style: "Trendy", formality: 2 },
  { name: "Navy Knit Scarf", category: "Accessories", color: "Navy", style: "Classic", formality: 3, season: "winter" },
  { name: "Silver Chain", category: "Accessories", color: "Grey", style: "Streetwear", formality: 1 },
];

export function demoWardrobeRows(userId: string) {
  return DEMO_WARDROBE.map((s) => ({
    user_id: userId,
    name: s.name,
    category: s.category,
    color: s.color,
    pattern: s.pattern ?? "solid",
    style: s.style ?? "Casual",
    fit: s.fit ?? "regular",
    sleeve: s.sleeve ?? null,
    season: s.season ?? "all",
    formality: s.formality ?? 2,
  }));
}
