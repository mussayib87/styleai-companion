import type {
  GeneratedOutfit,
  ItemRole,
  WardrobeItem,
} from "./types";
import { filterForOccasion } from "./clothing-selection";

export type StylistContext = {
  occasion?: string;
  weather?: {
    temperature?: number;
    condition?: string;
  };
  preferredStyles?: string[];
  preferredColors?: string[];
  preferredFit?: string;
  recentItemIds?: string[];
  likedItemIds?: string[];
  dislikedItemIds?: string[];
  colorPreference?: string[];
  stylePreference?: string[];
  fitPreference?: string;
  excludeSignatures?: string[];
  excludeImageKeys?: string[];
};

const OCCASION_FORMALITY: Record<string, number> = {
  Interview: 4,
  Wedding: 4,
  Office: 3,
  "Date/event": 3,
  Party: 3,
  College: 2,
  Casual: 2,
  Travel: 2,
  "Daily wear": 2,
};

const OCCASION_ALIASES: Record<string, string> = {
  marriage: "Wedding",
  wedding: "Wedding",
  partywear: "Party",
  party: "Party",
  date: "Date/event",
  dateevent: "Date/event",
  formal: "Office",
  smartcasual: "Date/event",
};

const FORMAL_STYLES = [
  "formal",
  "classic",
  "smart casual",
  "office",
  "interview",
  "wedding",
];

const CASUAL_STYLES = [
  "casual",
  "minimal",
  "simple",
  "streetwear",
  "trendy",
  "college",
  "travel",
];

const PARTY_STYLES = [
  "party",
  "partywear",
  "trendy",
  "streetwear",
  "smart casual",
  "formal",
  "classic",
];

const WEDDING_STYLES = [
  "wedding",
  "formal",
  "classic",
];

const OFFICE_STYLES = [
  "formal",
  "smart casual",
  "classic",
  "office",
];

const INTERVIEW_STYLES = [
  "formal",
  "classic",
  "interview",
];

const DATE_STYLES = [
  "trendy",
  "smart casual",
  "classic",
  "formal",
  "date",
];

function normalize(
  value: string | null | undefined,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function itemText(item: WardrobeItem): string {
  return [
    item.name,
    item.category,
    item.color,
    item.style,
    item.pattern,
  ]
    .filter(Boolean)
    .map(normalize)
    .join(" ");
}

function styleContains(
  item: WardrobeItem,
  styles: string[],
): boolean {
  const text = itemText(item);

  return styles.some((style) =>
    text.includes(normalize(style)),
  );
}

function canonicalOccasion(
  value: string | undefined,
): string {
  const normalized = normalize(value);

  if (!normalized) {
    return "Casual";
  }

  const direct = Object.keys(
    OCCASION_FORMALITY,
  ).find(
    (occasion) =>
      normalize(occasion) === normalized,
  );

  if (direct) {
    return direct;
  }

  return (
    OCCASION_ALIASES[normalized] ??
    value ??
    "Casual"
  );
}

export function availableItems(
  items: WardrobeItem[],
): WardrobeItem[] {
  return items.filter(
    (item) => !item.in_laundry,
  );
}

function uniqueById(
  items: WardrobeItem[],
): WardrobeItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function isDress(
  item: WardrobeItem,
): boolean {
  const category = normalize(item.category);
  const name = normalize(item.name);

  return (
    category === "dress" ||
    category === "dresses" ||
    /\bdress\b/.test(name) ||
    /\bgown\b/.test(name) ||
    /\bmaxi\b/.test(name) ||
    /\bmini dress\b/.test(name) ||
    /\bmidi dress\b/.test(name)
  );
}

function isBottom(
  item: WardrobeItem,
): boolean {
  const category = normalize(item.category);

  return (
    category === "pants" ||
    category === "jeans" ||
    category === "trousers" ||
    category === "shorts" ||
    category === "bottom" ||
    category === "bottoms"
  );
}

function roleOf(
  item: WardrobeItem,
): ItemRole {
  const category = normalize(item.category);

  if (isDress(item)) {
    return "top";
  }

  if (
    category === "shirts" ||
    category === "shirt" ||
    category === "t-shirts" ||
    category === "t-shirt" ||
    category === "tops" ||
    category === "top"
  ) {
    return "top";
  }

  if (isBottom(item)) {
    return "bottom";
  }

  if (
    category === "shoes" ||
    category === "shoe" ||
    category === "sneakers" ||
    category === "boots"
  ) {
    return "shoes";
  }

  if (
    category === "jackets" ||
    category === "jacket" ||
    category === "outerwear" ||
    category === "coat"
  ) {
    return "outerwear";
  }

  return "accessory";
}

function signature(
  items: WardrobeItem[],
): string {
  return items
    .map((item) => item.id)
    .sort()
    .join("|");
}

function isSuitableForOccasion(
  item: WardrobeItem,
  occasionValue: string,
): boolean {
  const occasion = normalize(
    canonicalOccasion(occasionValue),
  );

  const formality = Number(
    item.formality ?? 0,
  );

  const text = itemText(item);

  switch (occasion) {
    case "party":
      return (
        formality >= 3 ||
        styleContains(item, PARTY_STYLES) ||
        text.includes("party")
      );

    case "wedding":
      return (
        formality >= 4 ||
        styleContains(
          item,
          WEDDING_STYLES,
        ) ||
        text.includes("wedding")
      );

    case "office":
      return (
        formality >= 3 &&
        (
          styleContains(
            item,
            OFFICE_STYLES,
          ) ||
          formality >= 3
        )
      );

    case "interview":
      return (
        formality >= 4 ||
        styleContains(
          item,
          INTERVIEW_STYLES,
        )
      );

    case "college":
      return (
        formality <= 2 &&
        !styleContains(item, [
          "formal",
          "wedding",
          "interview",
        ])
      );

    case "casual":
      return (
        formality <= 2 &&
        !styleContains(item, [
          "formal",
          "wedding",
          "interview",
        ])
      );

    case "travel":
      return (
        formality <= 2 &&
        (
          styleContains(
            item,
            CASUAL_STYLES,
          ) ||
          !styleContains(
            item,
            FORMAL_STYLES,
          )
        )
      );

    case "daily wear":
      return (
        formality <= 2 &&
        !styleContains(item, [
          "formal",
          "wedding",
          "interview",
        ])
      );

    case "date/event":
      return (
        formality >= 2 &&
        (
          styleContains(
            item,
            DATE_STYLES,
          ) ||
          formality >= 3
        )
      );

    default:
      return true;
  }
}

function strictOccasionFilter(
  items: WardrobeItem[],
  occasion: string,
): WardrobeItem[] {
  return items.filter((item) =>
    isSuitableForOccasion(
      item,
      occasion,
    ),
  );
}

function colorHarmony(
  first: WardrobeItem,
  second: WardrobeItem,
): number {
  const a = normalize(first.color);
  const b = normalize(second.color);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1.5;
  }

  const neutral = [
    "black",
    "white",
    "grey",
    "gray",
    "navy",
    "beige",
    "cream",
    "brown",
    "charcoal",
  ];

  if (
    neutral.includes(a) ||
    neutral.includes(b)
  ) {
    return 1.2;
  }

  const pairs = new Set([
    "blue|white",
    "white|blue",
    "blue|beige",
    "beige|blue",
    "navy|white",
    "white|navy",
    "black|white",
    "white|black",
    "black|grey",
    "grey|black",
    "green|beige",
    "beige|green",
    "brown|cream",
    "cream|brown",
    "maroon|beige",
    "beige|maroon",
  ]);

  return pairs.has(`${a}|${b}`)
    ? 1.8
    : 0.3;
}

function patternHarmony(
  first: WardrobeItem,
  second: WardrobeItem,
): number {
  const a = normalize(first.pattern);
  const b = normalize(second.pattern);

  if (!a || !b) {
    return 0;
  }

  if (
    a === "solid" &&
    b === "solid"
  ) {
    return 1.2;
  }

  if (
    a === "solid" ||
    b === "solid"
  ) {
    return 1;
  }

  if (a === b) {
    return 0.3;
  }

  return -0.2;
}

function weatherFit(
  item: WardrobeItem,
  weather?: StylistContext["weather"],
): number {
  if (!weather) {
    return 0;
  }

  const category = normalize(
    item.category,
  );

  const season = normalize(
    item.season,
  );

  const condition = normalize(
    weather.condition,
  );

  const temperature =
    weather.temperature;

  let score = 0;

  if (
    category === "jackets" ||
    category === "jacket" ||
    category === "coat"
  ) {
    if (
      condition.includes("rain") ||
      condition.includes("cold") ||
      condition.includes("wind")
    ) {
      score += 2;
    }

    if (
      temperature !== undefined &&
      temperature <= 22
    ) {
      score += 2;
    }

    if (
      temperature !== undefined &&
      temperature >= 30
    ) {
      score -= 2;
    }
  }

  if (
    season.includes("summer") &&
    temperature !== undefined &&
    temperature >= 28
  ) {
    score += 1.5;
  }

  if (
    season.includes("winter") &&
    temperature !== undefined &&
    temperature <= 22
  ) {
    score += 1.5;
  }

  return score;
}

function preferenceScore(
  item: WardrobeItem,
  context: StylistContext,
): number {
  let score = 0;

  const styles = [
    ...(context.preferredStyles ?? []),
    ...(context.stylePreference ?? []),
  ].map(normalize);

  const colors = [
    ...(context.preferredColors ?? []),
    ...(context.colorPreference ?? []),
  ].map(normalize);

  const fit = normalize(
    context.preferredFit ??
      context.fitPreference,
  );

  if (
    styles.length &&
    styles.includes(normalize(item.style))
  ) {
    score += 2.5;
  }

  if (
    colors.length &&
    colors.includes(normalize(item.color))
  ) {
    score += 2;
  }

  if (
    fit &&
    fit === normalize(item.fit)
  ) {
    score += 1.5;
  }

  if (
    context.likedItemIds?.includes(
      item.id,
    )
  ) {
    score += 4;
  }

  if (
    context.dislikedItemIds?.includes(
      item.id,
    )
  ) {
    score -= 8;
  }

  return score;
}

function wearScore(
  item: WardrobeItem,
  context: StylistContext,
): number {
  let score = 0;

  if (
    context.recentItemIds?.includes(
      item.id,
    )
  ) {
    score -= 4;
  }

  const timesWorn = Number(
    item.times_worn ?? 0,
  );

  if (timesWorn === 0) {
    score += 2;
  } else if (timesWorn <= 2) {
    score += 1;
  } else if (timesWorn >= 8) {
    score -= 1;
  }

  if (item.last_worn_at) {
    const lastWorn =
      new Date(
        item.last_worn_at,
      ).getTime();

    if (!Number.isNaN(lastWorn)) {
      const days =
        (Date.now() - lastWorn) /
        (1000 * 60 * 60 * 24);

      if (days < 2) {
        score -= 3;
      } else if (days < 7) {
        score -= 1;
      } else if (days > 30) {
        score += 1;
      }
    }
  }

  return score;
}

function scoreItem(
  item: WardrobeItem,
  context: StylistContext,
): number {
  const target =
    OCCASION_FORMALITY[
      canonicalOccasion(
        context.occasion,
      )
    ] ?? 2;

  const formality = Number(
    item.formality ?? 0,
  );

  let score = 0;

  score += Math.max(
    0,
    3 -
      Math.abs(
        formality - target,
      ),
  );

  score += preferenceScore(
    item,
    context,
  );

  score += wearScore(
    item,
    context,
  );

  score += weatherFit(
    item,
    context.weather,
  );

  return score;
}

function combinationScore(
  items: WardrobeItem[],
  context: StylistContext,
): number {
  let score = 0;

  for (const item of items) {
    score += scoreItem(
      item,
      context,
    );
  }

  // FIX #1 and #2:
  // Never pass possibly-undefined array indexes
  // into colorHarmony/patternHarmony.
  for (
    let i = 0;
    i < items.length;
    i += 1
  ) {
    const first = items[i];

    if (!first) {
      continue;
    }

    for (
      let j = i + 1;
      j < items.length;
      j += 1
    ) {
      const second = items[j];

      if (!second) {
        continue;
      }

      score += colorHarmony(
        first,
        second,
      );

      score += patternHarmony(
        first,
        second,
      );
    }
  }

  const dress = items.find(isDress);

  if (dress) {
    score += 2;
  }

  return score;
}

type Candidate = {
  items: WardrobeItem[];
  roles: ItemRole[];
  score: number;
};

function buildCandidates(
  items: WardrobeItem[],
  context: StylistContext,
): Candidate[] {
  const tops = items.filter(
    (item) =>
      roleOf(item) === "top" &&
      !isDress(item),
  );

  const bottoms = items.filter(
    isBottom,
  );

  const shoes = items.filter(
    (item) =>
      roleOf(item) === "shoes",
  );

  const jackets = items.filter(
    (item) =>
      roleOf(item) === "outerwear",
  );

  const accessories = items.filter(
    (item) =>
      roleOf(item) === "accessory",
  );

  const dresses = items.filter(
    isDress,
  );

  const candidates: Candidate[] = [];

  // DRESSES

  for (const dress of dresses) {
    for (const shoe of shoes) {
      const base = [
        dress,
        shoe,
      ];

      candidates.push({
        items: base,
        roles: [
          "top",
          "shoes",
        ],
        score: combinationScore(
          base,
          context,
        ),
      });

      for (const jacket of jackets) {
        const withJacket = [
          dress,
          shoe,
          jacket,
        ];

        candidates.push({
          items: withJacket,
          roles: [
            "top",
            "shoes",
            "outerwear",
          ],
          score: combinationScore(
            withJacket,
            context,
          ),
        });

        for (
          const accessory of accessories
        ) {
          const full = [
            dress,
            shoe,
            jacket,
            accessory,
          ];

          candidates.push({
            items: full,
            roles: [
              "top",
              "shoes",
              "outerwear",
              "accessory",
            ],
            score:
              combinationScore(
                full,
                context,
              ),
          });
        }
      }

      for (
        const accessory of accessories
      ) {
        const withAccessory = [
          dress,
          shoe,
          accessory,
        ];

        candidates.push({
          items: withAccessory,
          roles: [
            "top",
            "shoes",
            "accessory",
          ],
          score:
            combinationScore(
              withAccessory,
              context,
            ),
        });
      }
    }
  }

  // TOP + BOTTOM

  for (const top of tops) {
    for (
      const bottom of bottoms
    ) {
      const base = [
        top,
        bottom,
      ];

      candidates.push({
        items: base,
        roles: [
          "top",
          "bottom",
        ],
        score: combinationScore(
          base,
          context,
        ),
      });

      for (const shoe of shoes) {
        const withShoes = [
          top,
          bottom,
          shoe,
        ];

        candidates.push({
          items: withShoes,
          roles: [
            "top",
            "bottom",
            "shoes",
          ],
          score:
            combinationScore(
              withShoes,
              context,
            ),
        });

        for (
          const jacket of jackets
        ) {
          const withJacket = [
            top,
            bottom,
            shoe,
            jacket,
          ];

          candidates.push({
            items: withJacket,
            roles: [
              "top",
              "bottom",
              "shoes",
              "outerwear",
            ],
            score:
              combinationScore(
                withJacket,
                context,
              ),
          });

          for (
            const accessory of accessories
          ) {
            const full = [
              top,
              bottom,
              shoe,
              jacket,
              accessory,
            ];

            candidates.push({
              items: full,
              roles: [
                "top",
                "bottom",
                "shoes",
                "outerwear",
                "accessory",
              ],
              score:
                combinationScore(
                  full,
                  context,
                ),
            });
          }
        }

        for (
          const accessory of accessories
        ) {
          const withAccessory = [
            top,
            bottom,
            shoe,
            accessory,
          ];

          candidates.push({
            items: withAccessory,
            roles: [
              "top",
              "bottom",
              "shoes",
              "accessory",
            ],
            score:
              combinationScore(
                withAccessory,
                context,
              ),
          });
        }
      }
    }
  }

  return candidates;
}

function candidateContainsDuplicateIds(
  candidate: Candidate,
): boolean {
  const ids = candidate.items.map(
    (item) => item.id,
  );

  return (
    new Set(ids).size !== ids.length
  );
}

function dedupeCandidates(
  candidates: Candidate[],
): Candidate[] {
  const seenSignatures =
    new Set<string>();

  return candidates.filter(
    (candidate) => {
      if (
        candidateContainsDuplicateIds(
          candidate,
        )
      ) {
        return false;
      }

      const hasDress =
        candidate.items.some(
          isDress,
        );

      const hasBottom =
        candidate.items.some(
          isBottom,
        );

      // A dress can NEVER be combined
      // with pants/bottoms.
      if (
        hasDress &&
        hasBottom
      ) {
        return false;
      }

      const sig = signature(
        candidate.items,
      );

      if (
        seenSignatures.has(sig)
      ) {
        return false;
      }

      seenSignatures.add(sig);

      return true;
    },
  );
}

function reasonsFor(
  items: WardrobeItem[],
  context: StylistContext,
): string[] {
  const reasons: string[] = [];

  const occasion =
    canonicalOccasion(
      context.occasion,
    );

  reasons.push(
    `Selected specifically for ${occasion}`,
  );

  const dress =
    items.find(isDress);

  if (dress) {
    reasons.push(
      `${dress.name} is a complete one-piece look`,
    );
  } else {
    const top =
      items.find(
        (item) =>
          roleOf(item) === "top",
      );

    const bottom =
      items.find(isBottom);

    if (top && bottom) {
      reasons.push(
        `${top.name} pairs naturally with ${bottom.name}`,
      );
    }
  }

  const colors = items
    .map(
      (item) => item.color,
    )
    .filter(Boolean);

  if (colors.length >= 2) {
    reasons.push(
      `The ${colors.join(" and ")} colors work well together`,
    );
  }

  const patterns = items
    .map((item) =>
      normalize(item.pattern),
    )
    .filter(Boolean);

  if (
    patterns.length > 1 &&
    patterns.every(
      (pattern) =>
        pattern === "solid",
    )
  ) {
    reasons.push(
      "The solid patterns keep the outfit balanced",
    );
  }

  if (
    context.preferredStyles?.some(
      (style) =>
        normalize(style) ===
        normalize(
          items[0]?.style,
        ),
    )
  ) {
    reasons.push(
      "Matches your preferred style",
    );
  }

  if (
    context.preferredFit &&
    items.some(
      (item) =>
        normalize(item.fit) ===
        normalize(
          context.preferredFit,
        ),
    )
  ) {
    reasons.push(
      "Matches your preferred fit",
    );
  }

  if (
    context.recentItemIds?.length &&
    items.some(
      (item) =>
        !context.recentItemIds?.includes(
          item.id,
        ),
    )
  ) {
    reasons.push(
      "Avoids recently worn pieces",
    );
  }

  if (
    context.weather &&
    items.some(
      (item) =>
        weatherFit(
          item,
          context.weather,
        ) > 0,
    )
  ) {
    reasons.push(
      "Works well with today's weather",
    );
  }

  return reasons.slice(0, 5);
}

function candidateToOutfit(
  candidate: Candidate,
  index: number,
  context: StylistContext,
): GeneratedOutfit {
  const occasion =
    canonicalOccasion(
      context.occasion,
    );

  // FIX #3:
  // Build pieces from the candidate arrays
  // using an explicit guaranteed role fallback.
  const pieces: {
    role: ItemRole;
    item: WardrobeItem;
  }[] = [];

  for (
    let i = 0;
    i < candidate.items.length;
    i += 1
  ) {
    const item =
      candidate.items[i];

    if (!item) {
      continue;
    }

    const role =
      candidate.roles[i];

    if (!role) {
      continue;
    }

    pieces.push({
      role,
      item,
    });
  }

  return {
    key: `${occasion}-${signature(
      candidate.items,
    )}`,
    title: `${occasion} look ${
      index + 1
    }`,
    occasion,
    score:
      Math.round(
        candidate.score * 10,
      ) / 10,
    reasons: reasonsFor(
      candidate.items,
      context,
    ),
    pieces,
  };
}

export function generateOutfits(
  items: WardrobeItem[],
  context: StylistContext = {},
  limit = 3,
): GeneratedOutfit[] {
  const occasion =
    canonicalOccasion(
      context.occasion,
    );

  // 1. Remove laundry.
  let wardrobe =
    availableItems(items);

  // 2. Every DB ID is unique.
  wardrobe =
    uniqueById(wardrobe);

  // 3. Strict occasion filtering.
  wardrobe =
    strictOccasionFilter(
      wardrobe,
      occasion,
    );

  // 4. Secondary clothing filter.
  const secondaryFiltered =
    filterForOccasion(
      wardrobe,
      occasion,
    );

  if (
    secondaryFiltered.length > 0
  ) {
    wardrobe =
      secondaryFiltered;
  }

  if (!wardrobe.length) {
    return [];
  }

  // 5. Generate combinations.
  let candidates =
    buildCandidates(
      wardrobe,
      {
        ...context,
        occasion,
      },
    );

  // 6. Remove invalid combinations.
  candidates =
    dedupeCandidates(
      candidates,
    );

  // 7. Remove explicitly excluded
  // signatures.
  const excludedSignatures =
    new Set(
      context.excludeSignatures ??
        [],
    );

  candidates =
    candidates.filter(
      (candidate) =>
        !excludedSignatures.has(
          signature(
            candidate.items,
          ),
        ),
    );

  // 8. Best score first.
  candidates.sort(
    (a, b) => {
      if (
        b.score !== a.score
      ) {
        return (
          b.score - a.score
        );
      }

      return signature(
        a.items,
      ).localeCompare(
        signature(
          b.items,
        ),
      );
    },
  );

  // 9. CRITICAL:
  // An exact DB wardrobe item ID can
  // appear only once in the result set.
  const usedItemIds =
    new Set<string>();

  const results: GeneratedOutfit[] =
    [];

  for (
    const candidate of candidates
  ) {
    if (
      results.length >= limit
    ) {
      break;
    }

    const candidateIds =
      candidate.items.map(
        (item) => item.id,
      );

    const alreadyUsed =
      candidateIds.some(
        (id) =>
          usedItemIds.has(id),
      );

    if (alreadyUsed) {
      continue;
    }

    if (
      new Set(
        candidateIds,
      ).size !==
      candidateIds.length
    ) {
      continue;
    }

    const hasDress =
      candidate.items.some(
        isDress,
      );

    const hasBottom =
      candidate.items.some(
        isBottom,
      );

    if (
      hasDress &&
      hasBottom
    ) {
      continue;
    }

    candidateIds.forEach(
      (id) =>
        usedItemIds.add(id),
    );

    results.push(
      candidateToOutfit(
        candidate,
        results.length,
        {
          ...context,
          occasion,
        },
      ),
    );
  }

  return results;
}

export function combinationCount(
  items: WardrobeItem[],
): number {
  const wardrobe =
    uniqueById(
      availableItems(items),
    );

  const tops =
    wardrobe.filter(
      (item) =>
        roleOf(item) === "top" &&
        !isDress(item),
    );

  const bottoms =
    wardrobe.filter(isBottom);

  const shoes =
    wardrobe.filter(
      (item) =>
        roleOf(item) === "shoes",
    );

  const dresses =
    wardrobe.filter(isDress);

  const normalCount =
    tops.length *
    bottoms.length *
    Math.max(
      shoes.length,
      1,
    );

  const dressCount =
    dresses.length *
    Math.max(
      shoes.length,
      1,
    );

  return (
    normalCount +
    dressCount
  );
}

export function planWeek(
  items: WardrobeItem[],
  contexts: StylistContext[],
): GeneratedOutfit[][] {
  const usedItemIds =
    new Set<string>();

  return contexts.map(
    (context) => {
      const outfits =
        generateOutfits(
          items,
          {
            ...context,
            recentItemIds: [
              ...(context.recentItemIds ??
                []),
              ...Array.from(
                usedItemIds,
              ),
            ],
          },
          1,
        );

      for (
        const outfit of outfits
      ) {
        for (
          const piece of outfit.pieces
        ) {
          usedItemIds.add(
            piece.item.id,
          );
        }
      }

      return outfits;
    },
  );
}

export function startOfWeek(
  date = new Date(),
): Date {
  const result =
    new Date(date);

  const day =
    result.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + diff,
  );

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}