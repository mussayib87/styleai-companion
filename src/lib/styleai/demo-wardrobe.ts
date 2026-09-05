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

export const DEMO_WARDROBE: Seed[] = [
  // SHIRTS
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
  { name: "Black Satin Shirt", category: "Shirts", color: "Black", style: "Luxury", sleeve: "full", formality: 4 },
  { name: "Mocha Cuban Collar Shirt", category: "Shirts", color: "Brown", style: "Trendy", sleeve: "short", formality: 2 },
  { name: "Sage Green Resort Shirt", category: "Shirts", color: "Green", style: "Premium Casual", sleeve: "short", formality: 2 },
  { name: "Stone Beige Shirt", category: "Shirts", color: "Beige", style: "Minimal", sleeve: "full", formality: 3 },
  { name: "Ivory Premium Shirt", category: "Shirts", color: "Ivory", style: "Classic", sleeve: "full", formality: 4 },
  { name: "Chocolate Linen Shirt", category: "Shirts", color: "Brown", style: "Luxury Casual", sleeve: "full", formality: 3 },
  { name: "Sky Blue Oxford Shirt", category: "Shirts", color: "Blue", style: "Business Casual", sleeve: "full", formality: 4 },
  { name: "Black Mandarin Shirt", category: "Shirts", color: "Black", style: "Modern", sleeve: "full", formality: 3 },

  // T-SHIRTS
  { name: "White Crew Tee", category: "T-Shirts", color: "White", style: "Minimal", sleeve: "short", formality: 1 },
  { name: "Black Oversized Tee", category: "T-Shirts", color: "Black", style: "Streetwear", sleeve: "short", fit: "loose", formality: 1 },
  { name: "Navy Polo", category: "T-Shirts", color: "Navy", style: "Smart Casual", sleeve: "short", formality: 2 },
  { name: "Olive Graphic Tee", category: "T-Shirts", color: "Olive", pattern: "printed", style: "Trendy", sleeve: "short", formality: 1 },
  { name: "Grey Melange Tee", category: "T-Shirts", color: "Grey", style: "Casual", sleeve: "short", formality: 1 },
  { name: "Maroon Henley", category: "T-Shirts", color: "Maroon", style: "Casual", sleeve: "full", formality: 2 },
  { name: "Green Relaxed Tee", category: "T-Shirts", color: "Green", style: "Casual", sleeve: "short", fit: "loose", formality: 1 },
  { name: "Cream Ribbed Tee", category: "T-Shirts", color: "Cream", style: "Minimal", sleeve: "short", formality: 1 },
  { name: "Essential Heavyweight Tee", category: "T-Shirts", color: "White", style: "Minimal", sleeve: "short", formality: 1 },
  { name: "Premium Oversized Tee", category: "T-Shirts", color: "Cream", style: "Streetwear", sleeve: "short", formality: 1 },
  { name: "Vintage Wash Tee", category: "T-Shirts", color: "Grey", style: "Trendy", sleeve: "short", formality: 1 },
  { name: "Luxury Ribbed Tee", category: "T-Shirts", color: "Black", style: "Premium", sleeve: "short", formality: 1 },
  { name: "Relaxed Fit Tee", category: "T-Shirts", color: "Olive", style: "Casual", sleeve: "short", formality: 1 },
  { name: "Minimal Logo Tee", category: "T-Shirts", color: "Navy", style: "Minimal", sleeve: "short", formality: 1 },
  { name: "Street Culture Tee", category: "T-Shirts", color: "Black", style: "Streetwear", sleeve: "short", formality: 1 },

  // JEANS
  { name: "Dark Blue Jeans", category: "Jeans", color: "Navy", style: "Casual", formality: 2 },
  { name: "Black Slim Jeans", category: "Jeans", color: "Black", style: "Casual", fit: "fitted", formality: 2 },
  { name: "Light Wash Jeans", category: "Jeans", color: "Blue", style: "Trendy", formality: 2 },
  { name: "Grey Straight Jeans", category: "Jeans", color: "Grey", style: "Casual", formality: 2 },
  { name: "Vintage Blue Denim", category: "Jeans", color: "Blue", style: "Premium Casual", formality: 2 },
  { name: "Jet Black Skinny Jeans", category: "Jeans", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Ice Blue Denim", category: "Jeans", color: "Blue", style: "Trendy", formality: 2 },
  { name: "Charcoal Denim", category: "Jeans", color: "Grey", style: "Minimal", formality: 2 },
  { name: "Stone Washed Denim", category: "Jeans", color: "Blue", style: "Vintage", formality: 2 },

  // TROUSERS
  { name: "Beige Chinos", category: "Trousers", color: "Beige", style: "Smart Casual", formality: 3 },
  { name: "Charcoal Formal Trousers", category: "Trousers", color: "Charcoal", style: "Formal", formality: 4 },
  { name: "Navy Tailored Trousers", category: "Trousers", color: "Navy", style: "Formal", formality: 4 },

  { name: "Italian Wool Trousers", category: "Trousers", color: "Charcoal", style: "Luxury Formal", formality: 4 },

  { name: "Slim Beige Trousers", category: "Trousers", color: "Beige", style: "Business Casual", formality: 4 },
  { name: "Cream Tailored Pants", category: "Trousers", color: "Cream", style: "Luxury", formality: 4 },
  { name: "Black Executive Trousers", category: "Trousers", color: "Black", style: "Formal", formality: 4 },
  { name: "Olive Smart Trousers", category: "Trousers", color: "Olive", style: "Smart Casual", formality: 3 },

  // PANTS
  { name: "Olive Cargo Pants", category: "Pants", color: "Olive", style: "Streetwear", fit: "loose", formality: 1 },
  { name: "Black Joggers", category: "Pants", color: "Black", style: "Casual", fit: "loose", formality: 1 },
  { name: "Cream Wide Pants", category: "Pants", color: "Cream", style: "Trendy", fit: "loose", formality: 2 },
  { name: "Cargo Utility Pants", category: "Pants", color: "Khaki", style: "Streetwear", fit: "loose", formality: 1 },
  { name: "Techwear Joggers", category: "Pants", color: "Black", style: "Techwear", fit: "loose", formality: 1 },
  { name: "Wide Street Pants", category: "Pants", color: "Grey", style: "Streetwear", fit: "loose", formality: 1 },
  { name: "Relaxed Cargo Pants", category: "Pants", color: "Olive", style: "Casual", fit: "loose", formality: 1 },

  // SHOES
  { name: "White Sneakers", category: "Shoes", color: "White", style: "Casual", formality: 2 },
  { name: "Black Sneakers", category: "Shoes", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Brown Leather Loafers", category: "Shoes", color: "Brown", style: "Classic", formality: 4 },
  { name: "Black Derby Shoes", category: "Shoes", color: "Black", style: "Formal", formality: 4 },
  { name: "Air Street Sneakers", category: "Shoes", color: "White", style: "Streetwear", formality: 2 },
  { name: "Luxury Leather Sneakers", category: "Shoes", color: "White", style: "Luxury", formality: 3 },
  { name: "Italian Leather Loafers", category: "Shoes", color: "Brown", style: "Classic", formality: 4 },
  { name: "Premium Derby Shoes", category: "Shoes", color: "Black", style: "Formal", formality: 4 },

  { name: "Chunky Fashion Sneakers", category: "Shoes", color: "Grey", style: "Trendy", formality: 2 },
  { name: "Chelsea Boots", category: "Shoes", color: "Black", style: "Luxury", formality: 4 },

  // JACKETS
  { name: "Denim Jacket", category: "Jackets", color: "Blue", style: "Casual", formality: 2 },
  { name: "Charcoal Overcoat", category: "Jackets", color: "Charcoal", style: "Classic", formality: 4, season: "winter" },
  { name: "Varsity Bomber Jacket", category: "Jackets", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Luxury Trench Coat", category: "Jackets", color: "Beige", style: "Classic", formality: 4 },
  { name: "Oversized Puffer Jacket", category: "Jackets", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Brown Suede Jacket", category: "Jackets", color: "Brown", style: "Luxury", formality: 4 },
  { name: "Minimal Harrington Jacket", category: "Jackets", color: "Navy", style: "Smart Casual", formality: 3 },

  // ACCESSORIES
  { name: "Silver Watch", category: "Accessories", color: "Grey", style: "Classic", formality: 3 },
  { name: "Black Leather Belt", category: "Accessories", color: "Black", style: "Classic", formality: 3 },
  { name: "Brown Woven Belt", category: "Accessories", color: "Brown", style: "Casual", formality: 2 },
  { name: "Black Cap", category: "Accessories", color: "Black", style: "Streetwear", formality: 1 },
  { name: "Beige Tote Bag", category: "Accessories", color: "Beige", style: "Minimal", formality: 2 },
  { name: "Round Sunglasses", category: "Accessories", color: "Black", style: "Trendy", formality: 2 },
  { name: "Navy Knit Scarf", category: "Accessories", color: "Navy", style: "Classic", formality: 3, season: "winter" },
  { name: "Silver Chain", category: "Accessories", color: "Grey", style: "Streetwear", formality: 1 },
  { name: "Luxury Silver Watch", category: "Accessories", color: "Silver", style: "Luxury", formality: 4 },
  { name: "Black Designer Sunglasses", category: "Accessories", color: "Black", style: "Luxury", formality: 2 },
  { name: "Premium Leather Wallet", category: "Accessories", color: "Brown", style: "Classic", formality: 3 },
  { name: "Minimal Bracelet", category: "Accessories", color: "Silver", style: "Minimal", formality: 2 },
  { name: "Luxury Chain", category: "Accessories", color: "Silver", style: "Streetwear", formality: 2 },
  { name: "Premium Backpack", category: "Accessories", color: "Black", style: "Modern", formality: 2 },
  { name: "Crossbody Bag", category: "Accessories", color: "Black", style: "Streetwear", formality: 2 },
  { name: "Luxury Ring", category: "Accessories", color: "Silver", style: "Luxury", formality: 2 },
];

function demoImageUrl(item: Seed) {
  const searchTerms: Record<string, string> = {
    Shirts: "mens,shirt",
    "T-Shirts": "mens,tshirt",
    Jeans: "jeans,denim",
    Trousers: "mens,trousers",
    Pants: "cargo,pants",
    Shoes: "shoes,fashion",
    Jackets: "mens,jacket",
    Accessories: "fashion,accessories",
  };

  const seed = `${item.category}-${item.name}`
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  const terms = searchTerms[item.category] ?? "fashion,clothing";

  return `https://loremflickr.com/900/1200/${terms}?lock=${seed}`;
}

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
    image_url: demoImageUrl(s),
  }));
}