import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shirt, Sparkles, ShoppingBag, Wand2, CalendarClock } from "lucide-react";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, OutfitCard, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, usePrefs, useSeedDemoWardrobe, useWardrobe } from "@/lib/styleai/data";
import { availableItems, combinationCount, generateOutfits } from "@/lib/styleai/engine";

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
          ...(prefs?.color_preference ? { colorPreference: prefs.color_preference } : {}),
          ...(prefs?.style_preference ? { stylePreference: prefs.style_preference } : {}),
          ...(prefs?.fit_preference ? { fitPreference: prefs.fit_preference } : {}),
        },
        3,
      ),
    [items, prefs],
  );

  const ready = availableItems(items).length;

  return (
    <AppShell
      title={`Hi ${profile?.display_name ?? "there"}`}
      subtitle="Here's what your wardrobe can do today."
      action={
        <Button asChild size="sm">
          <Link to="/stylist">
            <Sparkles className="size-4" /> Style me
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <Stat label="Items in wardrobe" value={items.length} />
          <Stat label="Ready to wear" value={ready} />
          <Stat label="Possible combinations" value={combinationCount(items)} />
        </section>

        <section>
          <SectionTitle title="Quick actions" hint="Jump straight into a stylist flow" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="surface-card flex flex-col gap-2 rounded-2xl p-4 transition-colors hover:bg-secondary"
              >
                <a.icon className="size-5 text-primary-glow" />
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle
            title="Today's outfit"
            hint="Ranked from the clothes you already own"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/stylist">More ideas</Link>
              </Button>
            }
          />
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-56 rounded-3xl" />
              <Skeleton className="h-56 rounded-3xl" />
            </div>
          ) : outfits.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {outfits.map((o, i) => (
                <OutfitCard key={o.id} outfit={o} rank={i + 1} />
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
      </div>
    </AppShell>
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
