import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Heart,
  Shirt,
  ShoppingBag,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFeedback,
  useProfile,
  usePrefs,
  useSeedDemoWardrobe,
  useWardrobe,
} from "@/lib/styleai/data";
import { availableItems, combinationCount, generateOutfits } from "@/lib/styleai/engine";
import type { GeneratedOutfit } from "@/lib/styleai/types";
import { getAiPickVisual } from "@/lib/styleai/ai-pick-visuals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StyleAI — Your AI Personal Stylist" },
      {
        name: "description",
        content:
          "StyleAI learns your wardrobe, suggests outfits for any occasion, plans your week and evaluates new purchases.",
      },
      { property: "og:title", content: "StyleAI — Your AI Personal Stylist" },
      {
        property: "og:description",
        content: "Outfit ideas from the clothes you already own, powered by AI.",
      },
    ],
  }),
  component: Home,
});

const QUICK_ACTIONS = [
  { to: "/stylist", label: "AI Stylist", icon: Sparkles },
  { to: "/planner", label: "Plan week", icon: CalendarClock },
  { to: "/try-on", label: "Try-on", icon: Wand2 },
  { to: "/shopping", label: "Should I buy?", icon: ShoppingBag },
] as const;

function Home() {
  const { data: profile } = useProfile();
  const { data: prefs } = usePrefs();
  const { data: wardrobe, isLoading } = useWardrobe();
  const seed = useSeedDemoWardrobe();

  const items = wardrobe ?? [];

  const outfits = useMemo(
    () =>
      generateOutfits(
        items,
        {
          occasion: "Casual",
          ...(prefs?.colors?.length ? { preferredColors: prefs.colors } : {}),
          ...(prefs?.styles?.length ? { preferredStyles: prefs.styles } : {}),
          ...(prefs?.fit ? { preferredFit: prefs.fit } : {}),
        },
        3,
      ),
    [items, prefs],
  );

  const ready = availableItems(items).length;

  return (
    <AppShell
      className="fashion-home"
      title={`Hi ${profile?.display_name?.trim() || "Mussayib"} 👋`}
      subtitle="Your AI Stylist is ready to elevate your style ✨"
    >
      <div className="space-y-10 overflow-x-hidden pb-4">
        <section className="home-hero overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <div className="relative z-10 max-w-xl">
            <p className="home-eyebrow">STYLEAI / PERSONAL EDIT</p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-medium leading-[0.98] tracking-tight text-white sm:text-6xl">
              Smart style,
              <br />
              made just for you
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65 sm:text-base">
              Upload your photo and let AI create looks that truly match you.
            </p>
            <Button
              asChild
              className="mt-7 h-11 rounded-full bg-[#e8c99b] px-5 text-[#241c16] hover:bg-[#f0d7b2]"
            >
              <Link to="/try-on">
                <Sparkles className="size-4" /> ✨ Try On Me
              </Link>
            </Button>
          </div>
        <div className="hero-wardrobe" aria-label="StyleAI editorial fashion edit">
  {[
    {
      src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=90",
      alt: "Premium tailored shirts",
    },
    {
      src: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=90",
      alt: "Luxury dark shirt",
    },
    {
      src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=90",
      alt: "Premium jacket",
    },
    {
      src: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=90",

    },
  ].map((image, index) => (
    <div key={image.src} className={`hero-piece hero-piece-${index + 1}`}>
      <img src={image.src} alt={image.alt} className="size-full object-cover" />
    </div>
  ))}
  <span className="hero-caption">YOUR EDIT / 01</span>
</div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Stat label="Items in wardrobe" value={items.length} />
          <Stat label="Ready to wear" value={ready} />
          <Stat label="Possible combinations" value={combinationCount(items)} />
        </section>

        <section>
          <SectionTitle
            title="AI picks for you ✨"
            hint="Handpicked outfits AI thinks you'll love"
          />
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-72 rounded-3xl" />
              <Skeleton className="h-72 rounded-3xl" />
              <Skeleton className="h-72 rounded-3xl" />
            </div>
          ) : outfits.length ? (
            <div className="home-picks -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
              {outfits.map((outfit) => (
                <HomeOutfitCard key={outfit.key} outfit={outfit} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Shirt className="size-5" />}
              title="Your wardrobe is empty"
              body="Add a few pieces — or load a demo wardrobe — and StyleAI will start ranking outfits for you."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link to="/wardrobe/add">Add clothes</Link>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => seed.mutate()}
                    disabled={seed.isPending}
                  >
                    {seed.isPending ? "Loading demo…" : "Load demo wardrobe"}
                  </Button>
                </div>
              }
            />
          )}
        </section>

        <section className="stylist-banner flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#c7a36a]/15 text-[#d7b67f]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7b67f]">
                AI Stylist
              </p>
              <h2 className="mt-2 max-w-lg font-display text-2xl text-white sm:text-3xl">
                Get personalized outfit ideas based on your style, mood & occasion
              </h2>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/stylist">
              Get suggestions <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </section>

        <section>
          <SectionTitle title="Quick actions ✨" hint="Make your next style move" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to} className="home-action group rounded-2xl p-4 sm:p-5">
                <a.icon className="size-5 text-[#a87843]" />
                <span className="mt-8 block text-sm font-semibold">{a.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {a.label === "AI Stylist"
                    ? "Find your style"
                    : a.label === "Plan week"
                      ? "Outfits for 7 days"
                      : a.label === "Try-on"
                        ? "Virtual try-on"
                        : "AI opinion"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function HomeOutfitCard({ outfit }: { outfit: GeneratedOutfit }) {
  const feedback = useFeedback();
  return (
    <article className="home-pick-card group min-w-[78vw] snap-start overflow-hidden rounded-3xl sm:min-w-0">
      <Link to="/stylist" className="block">
        <div className="relative aspect-[0.92] overflow-hidden bg-[#e7dacb] p-3">
          <div className="grid h-full grid-cols-2 gap-2">
            {outfit.pieces.slice(0, 4).map((piece) => (
              <div key={piece.item.id} className="overflow-hidden rounded-2xl bg-white/35">
                <AiPickVisual item={piece.item} />
              </div>
            ))}
          </div>
          <span className="absolute left-5 top-5 rounded-full bg-[#f8f2ea]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#604936]">
            {outfit.occasion}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-semibold">{outfit.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {outfit.pieces.length} pieces from your wardrobe
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-[#9b6f3b]">{outfit.score}%</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Save ${outfit.title}`}
        onClick={() => feedback.mutate({ outfit, signal: "save" })}
        className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-[#f8f2ea]/90 text-[#604936] transition hover:bg-white"
      >
        <Heart className="size-4" />
      </button>
    </article>
  );
}

function AiPickVisual({
  item,
}: {
  item: GeneratedOutfit["pieces"][number]["item"];
}) {
  if (item.image_url) {
    return (
      <img
        src={item.image_url}
        alt={item.name}
        loading="lazy"
        className="size-full object-cover"
      />
    );
  }

  return (
    <div className="grid size-full place-items-center bg-[#2c2119]">
      <Shirt className="size-8 text-[#d7b67f]" />
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="font-display text-2xl font-semibold">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
