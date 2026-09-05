import type { WardrobeItem } from "./types";

export type AiPickVisual = {
  category: string;
  imageUrl: string;
  imageUrls: string[];
};

const AI_PICK_VISUALS: Record<string, AiPickVisual> = {
  shirts: {
    category: "Shirts",
    imageUrl:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    ],
  },
  "t-shirts": {
    category: "T-Shirts",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
    ],
  },
  jeans: {
    category: "Jeans",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=85",
    ],
  },
  trousers: {
    category: "Trousers",
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
    ],
  },
  pants: {
    category: "Pants",
    imageUrl:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1506629905607-d9f9d8f4e0f0?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=85",
    ],
  },
  shoes: {
    category: "Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=85",
    ],
  },
  jackets: {
    category: "Jackets",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    ],
  },
  accessories: {
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85",
    imageUrls: [
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    ],
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  shirt: "shirts",
  "t-shirt": "t-shirts",
  tshirt: "t-shirts",
  tee: "t-shirts",
  jean: "jeans",
  trouser: "trousers",
  pant: "pants",
  shoe: "shoes",
  sneaker: "shoes",
  sneakers: "shoes",
  jacket: "jackets",
  accessory: "accessories",
};

export function getAiPickVisual(
  item: Pick<WardrobeItem, "id" | "category" | "name">,
): AiPickVisual | null {
  const normalizedCategory = item.category.trim().toLowerCase();
  const key =
    AI_PICK_VISUALS[normalizedCategory] !== undefined
      ? normalizedCategory
      : CATEGORY_ALIASES[normalizedCategory];

  const visual = key ? AI_PICK_VISUALS[key] : undefined;
  if (!visual) return null;

  const seed = `${item.id}:${item.name}`
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  const imageUrl =
  visual.imageUrls[seed % visual.imageUrls.length] ?? visual.imageUrl;

  return {
    ...visual,
    imageUrl,
  };
}