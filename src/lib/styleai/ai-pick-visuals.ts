import type { WardrobeItem } from "./types";

export type AiPickVisual = {
  category: string;
  imageUrl: string;
  imageUrls?: string[];
};

const AI_PICK_VISUALS: Record<string, AiPickVisual> = {
  shirts: {
    category: "Shirts",
    imageUrl:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    ],
  },
  "t-shirts": {
    category: "T-Shirts",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    ],
  },
  pants: {
    category: "Pants",
    imageUrl:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1506629905607-d9f9d8f4e0f0?auto=format&fit=crop&w=900&q=85",
    ],
  },
  jeans: {
    category: "Jeans",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1555689502-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    ],
  },
  trousers: {
    category: "Trousers",
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    ],
  },
  shoes: {
    category: "Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=85",
    ],
  },
  jackets: {
    category: "Jackets",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    ],
  },
  dresses: {
    category: "Dresses",
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    ],
  },
  accessories: {
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
    ],
  },
  other: {
    category: "Other",
    imageUrl:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  shirt: "shirts",
  "t-shirt": "t-shirts",
  tshirt: "t-shirts",
  pant: "pants",
  trouser: "trousers",
  jacket: "jackets",
  outerwear: "jackets",
  dress: "dresses",
  shoe: "shoes",
  sneaker: "shoes",
  sneakers: "shoes",
  accessory: "accessories",
};

export function getAiPickVisual(
  item: Pick<WardrobeItem, "id" | "category" | "name">,
): AiPickVisual | null {
  const category = item.category.trim().toLowerCase();
  const key = AI_PICK_VISUALS[category] ? category : CATEGORY_ALIASES[category];
  if (!key) return null;
  const visual = AI_PICK_VISUALS[key];
  if (!visual) return null;
  const options = visual.imageUrls ?? [visual.imageUrl];
  const seed = `${item.id}:${item.name}`
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return { ...visual, imageUrl: options[seed % options.length] ?? visual.imageUrl };
}
