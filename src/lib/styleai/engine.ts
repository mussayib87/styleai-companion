import {
  type GeneratedOutfit,
  type ItemRole,
  type WardrobeItem,
  roleOf,
} from "./types";

/**
 * StyleAI Outfit Optimizer.
 *
 * Deterministic, explainable ranking engine that runs over the user's real
 * wardrobe. It is the "analyze -> rank -> explain" stage of the stylist agent
 * pipeline and stays independent of any AI provider so it always works.
 */

export type StylistContext = {
  occasion: string;
  weather?: { condition: "hot" | "mild" | "cold" | "rain"; tempC?: number } | undefined;
  preferredStyles?: string[];
  preferredColors?: string[];
  preferredFit?: string;
  /** item ids worn recently, most recent first */
  recentItemIds?: string[];
  /** item ids the user has signalled they like */
  likedItemIds?: string[];
  dislikedItemIds?: string[];
  colorPreference?: string | undefined;
  stylePreference?: string | undefined;
  fitPreference?: string | undefined;
  /** avoid producing outfits with these signatures (already used this week) */
  excludeSignatures?: string[];
};

const NEUTRALS = ["white", "black", "grey", "charcoal", "beige", "cream", "navy"];

const OCCASION_FORMALITY: Record<string, number> = {
  Interview: 4,
  Wedding: 4,
  Office: 3,
  "Smart Casual": 3,
  "Date/event": 3,
  Party: 3,
  College: 2,
  Casual: 2,
  Travel: 2,
  "Daily wear": 2,
  Relaxed: 1,
};

function colorHarmony(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return 8;
  const nx = NEUTRALS.includes(x);
  const ny = NEUTRALS.includes(y);
  if (nx && ny) return 16;
  if (nx || ny) return 14;
  const clash = [
    ["green", "maroon"],
    ["pink", "olive"],
    ["yellow", "pink"],
    ["brown", "maroon"],
  ];
  if (clash.some(([p, q]) => (x === p && y === q) || (x === q && y === p))) return 2;
  return 8;
}

function patternHarmony(a: string, b: string): number {
  if (a === "solid" && b === "solid") return 10;
  if (a === "solid" || b === "solid") return 12;
  if (a === b) return 4;
  return 5;
}

function daysSince(date: string | null): number {
  if (!date) return 60;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

function weatherFit(item: WardrobeItem, ctx: StylistContext): number {
  const w = ctx.weather?.condition;
  if (!w) return 0;
  if (w === "hot") {
    if (item.category === "Jackets") return -18;
    if (item.sleeve === "short" || item.season === "summer") return 6;
  }
  if (w === "cold") {
    if (item.category === "Jackets") return 12;
    if (item.sleeve === "short") return -6;
  }
  if (w === "rain") {
    if (item.category === "Jackets") return 8;
    if (item.color.toLowerCase() === "white") return -4;
  }
  return 0;
}

function scoreItem(item: WardrobeItem, ctx: StylistContext, targetFormality: number): number {
  let s = 0;
  s -= Math.abs(item.formality - targetFormality) * 7;
  if (ctx.preferredStyles?.some((v) => v.toLowerCase().includes(item.style.toLowerCase()))) s += 8;
  if (ctx.stylePreference && item.style.toLowerCase() === ctx.stylePreference.toLowerCase()) s += 10;
  if (ctx.preferredColors?.some((c) => c.toLowerCase() === item.color.toLowerCase())) s += 7;
  if (ctx.colorPreference && item.color.toLowerCase() === ctx.colorPreference.toLowerCase()) s += 12;
  const fit = ctx.fitPreference ?? ctx.preferredFit;
  if (fit && item.fit === fit) s += 5;
  if (ctx.likedItemIds?.includes(item.id)) s += 9;
  if (ctx.dislikedItemIds?.includes(item.id)) s -= 22;
  s += weatherFit(item, ctx);

  const recentIndex = ctx.recentItemIds?.indexOf(item.id) ?? -1;
  if (recentIndex === 0) s -= 26;
  else if (recentIndex > 0 && recentIndex < 4) s -= 14;
  const rest = daysSince(item.last_worn_at);
  s += Math.min(10, rest / 3);
  if (item.times_worn === 0) s += 4;
  return s;
}

function pick(items: WardrobeItem[], role: ItemRole): WardrobeItem[] {
  return items.filter((i) => roleOf(i) === role);
}

export function availableItems(items: WardrobeItem[]): WardrobeItem[] {
  return items.filter((i) => !i.in_laundry);
}

function signature(pieces: WardrobeItem[]): string {
  return pieces
    .map((p) => p.id)
    .sort()
    .join("|");
}

function titleFor(pieces: { role: ItemRole; item: WardrobeItem }[]): string {
  const top = pieces.find((p) => p.role === "top")?.item;
  const bottom = pieces.find((p) => p.role === "bottom")?.item;
  const shoes = pieces.find((p) => p.role === "shoes")?.item;
  return [top?.name, bottom?.name, shoes?.name].filter(Boolean).join(" + ");
}

/**
 * Rank the strongest complete outfits (top + bottom + shoes + optional
 * outerwear + optional accessory) from the wardrobe. Never returns every
 * mathematical combination — only the strongest ranked looks.
 */
export function generateOutfits(
  wardrobe: WardrobeItem[],
  ctx: StylistContext,
  limit = 5,
): GeneratedOutfit[] {
  const items = availableItems(wardrobe);
  const tops = pick(items, "top");
  const bottoms = pick(items, "bottom");
  const shoes = pick(items, "shoes");
  const jackets = pick(items, "outerwear");
  const accessories = pick(items, "accessory");

  if (!tops.length || !bottoms.length) return [];

  const target = OCCASION_FORMALITY[ctx.occasion] ?? 2;
  const seen = new Set(ctx.excludeSignatures ?? []);
  const results: GeneratedOutfit[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      let base = 46;
      base += scoreItem(top, ctx, target) + scoreItem(bottom, ctx, target);
      base += colorHarmony(top.color, bottom.color);
      base += patternHarmony(top.pattern, bottom.pattern);
      base -= Math.abs(top.formality - bottom.formality) * 5;

      const shoe = shoes
        .map((s) => ({ s, v: scoreItem(s, ctx, target) + colorHarmony(s.color, bottom.color) }))
        .sort((a, b) => b.v - a.v)[0];

      const pieces: { role: ItemRole; item: WardrobeItem }[] = [
        { role: "top", item: top },
        { role: "bottom", item: bottom },
      ];
      if (shoe) {
        pieces.push({ role: "shoes", item: shoe.s });
        base += shoe.v * 0.4;
      }

      const wantsJacket =
        ctx.weather?.condition === "cold" || ctx.weather?.condition === "rain" || target >= 3;
      if (wantsJacket && jackets.length) {
        const jacket = jackets
          .map((j) => ({ j, v: scoreItem(j, ctx, target) + colorHarmony(j.color, top.color) }))
          .sort((a, b) => b.v - a.v)[0];
        if (jacket) {
          pieces.push({ role: "outerwear", item: jacket.j });
          base += jacket.v * 0.25;
        }
      }
      if (accessories.length) {
        const acc = accessories
          .map((a) => ({ a, v: scoreItem(a, ctx, target) }))
          .sort((x, y) => y.v - x.v)[0];
        if (acc) {
          pieces.push({ role: "accessory", item: acc.a });
          base += 4;
        }
      }

      const sig = signature(pieces.map((p) => p.item));
      if (seen.has(sig)) continue;
      seen.add(sig);

      const reasons: string[] = [];
      reasons.push(`Suitable for ${ctx.occasion.toLowerCase()}`);
      if (colorHarmony(top.color, bottom.color) >= 14)
        reasons.push(`${top.color} works cleanly with ${bottom.color.toLowerCase()}`);
      if (ctx.weather) reasons.push(`Appropriate for ${ctx.weather.condition} weather`);
      if ((ctx.recentItemIds ?? []).every((id) => !pieces.some((p) => p.item.id === id)))
        reasons.push("You haven't worn this combination recently");
      reasons.push("Uses clothes already available in your wardrobe");
      if (ctx.preferredStyles?.length) reasons.push("Works with your selected style");

      results.push({
        key: sig,
        title: titleFor(pieces),
        occasion: ctx.occasion,
        score: Math.max(55, Math.min(98, Math.round(base))),
        reasons: reasons.slice(0, 5),
        pieces,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Total number of distinct complete looks the wardrobe can support. */
export function combinationCount(wardrobe: WardrobeItem[]): number {
  const items = availableItems(wardrobe);
  const t = pick(items, "top").length;
  const b = pick(items, "bottom").length;
  const s = Math.max(1, pick(items, "shoes").length);
  return t * b * s;
}

export type PlannedDay = {
  date: string;
  label: string;
  occasion: string;
  outfit: GeneratedOutfit | null;
};

export function planWeek(
  wardrobe: WardrobeItem[],
  weekStart: Date,
  routine: Record<string, string>,
  ctx: Omit<StylistContext, "occasion">,
  locked: Record<string, GeneratedOutfit> = {},
): PlannedDay[] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const used: string[] = [];
  const usedItems: string[] = [];
  const plan: PlannedDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const label = days[date.getDay()]!;
    const occasion = routine[label] ?? "Casual";
    const iso = date.toISOString().slice(0, 10);

    if (locked[iso]) {
      plan.push({ date: iso, label, occasion, outfit: locked[iso]! });
      usedItems.unshift(...locked[iso]!.pieces.map((p) => p.item.id));
      continue;
    }

    const [best] = generateOutfits(
      wardrobe,
      {
        ...ctx,
        occasion,
        excludeSignatures: used,
        recentItemIds: [...usedItems, ...(ctx.recentItemIds ?? [])],
      },
      1,
    );
    if (best) {
      used.push(best.key);
      usedItems.unshift(...best.pieces.map((p) => p.item.id));
    }
    plan.push({ date: iso, label, occasion, outfit: best ?? null });
  }
  return plan;
}

export function startOfWeek(d = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}
