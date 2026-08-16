import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChartNoAxesColumn } from "lucide-react";
import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, ItemSwatch, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWardrobe, useWearHistory } from "@/lib/styleai/data";
import { roleOf } from "@/lib/styleai/types";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Wardrobe Analytics — StyleAI" },
      { name: "description", content: "Cost per wear, most-worn pieces and gaps." },
      { property: "og:title", content: "Wardrobe Analytics — StyleAI" },
      { property: "og:description", content: "Cost per wear, most-worn pieces and gaps." },
    ],
  }),
  component: Page,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Page() {
  const { data: wardrobe = [], isLoading } = useWardrobe();
  const { data: history = [] } = useWearHistory();

  const stats = useMemo(() => {
    const total = wardrobe.length;
    const worn = wardrobe.filter((i) => i.times_worn > 0);
    const never = wardrobe.filter((i) => i.times_worn === 0);
    const totalWears = wardrobe.reduce((s, i) => s + i.times_worn, 0);
    const mostWorn = [...wardrobe].sort((a, b) => b.times_worn - a.times_worn).slice(0, 6);
    const byCategory = new Map<string, number>();
    for (const i of wardrobe) byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + 1);
    const byRole = new Map<string, number>();
    for (const i of wardrobe) {
      const r = roleOf(i);
      byRole.set(r, (byRole.get(r) ?? 0) + 1);
    }
    const gaps = (["top", "bottom", "shoes", "outerwear"] as const).filter(
      (r) => (byRole.get(r) ?? 0) < 3,
    );
    const colorCount = new Map<string, number>();
    for (const i of wardrobe) colorCount.set(i.color, (colorCount.get(i.color) ?? 0) + 1);
    return {
      total,
      utilisation: total ? Math.round((worn.length / total) * 100) : 0,
      never,
      totalWears,
      avgWears: total ? (totalWears / total).toFixed(1) : "0",
      mostWorn,
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      colors: [...colorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      gaps,
    };
  }, [wardrobe]);

  if (isLoading) {
    return (
      <AppShell title="Wardrobe Analytics" subtitle="Cost per wear, most-worn pieces and gaps.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-64 rounded-3xl sm:col-span-2" />
        </div>
      </AppShell>
    );
  }

  if (!wardrobe.length) {
    return (
      <AppShell title="Wardrobe Analytics" subtitle="Cost per wear, most-worn pieces and gaps.">
        <EmptyState
          icon={<ChartNoAxesColumn className="size-5" />}
          title="No data yet"
          body="Add clothes to your wardrobe and log what you wear — analytics build up from there."
          action={
            <Button asChild>
              <Link to="/wardrobe/add">Add clothes</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const maxCategory = Math.max(...stats.categories.map(([, n]) => n), 1);

  return (
    <AppShell title="Wardrobe Analytics" subtitle="Cost per wear, most-worn pieces and gaps.">
      <div className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Pieces owned" value={String(stats.total)} />
          <Stat label="Total wears logged" value={String(stats.totalWears)} hint={`${stats.avgWears} avg per piece`} />
          <Stat label="Wardrobe utilisation" value={`${stats.utilisation}%`} hint="Pieces worn at least once" />
          <Stat label="Outfits logged" value={String(history.length)} hint="From your calendar" />
        </div>

        <section>
          <SectionTitle title="Most worn" hint="Your hardest-working pieces." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.mostWorn.map((i) => (
              <div key={i.id} className="surface-card overflow-hidden rounded-2xl">
                <div className="aspect-square overflow-hidden">
                  <ItemSwatch item={i} />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.times_worn} wear{i.times_worn === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Category mix" hint="Where your wardrobe is concentrated." />
          <div className="surface-card space-y-3 rounded-3xl p-5">
            {stats.categories.map(([cat, n]) => (
              <div key={cat}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="font-medium">{n}</span>
                </div>
                <Progress value={(n / maxCategory) * 100} />
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <SectionTitle title="Gaps to fill" hint="Categories that limit new combinations." />
            <div className="surface-card rounded-3xl p-5 text-sm">
              {stats.gaps.length ? (
                <ul className="space-y-2 text-muted-foreground">
                  {stats.gaps.map((g) => (
                    <li key={g}>
                      Only a few <span className="text-foreground">{g}</span> pieces — adding one or
                      two neutral options unlocks several outfits.
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Your wardrobe is well balanced across tops, bottoms, shoes and outerwear.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle title="Never worn" hint="Give these a chance this week." />
            <div className="surface-card rounded-3xl p-5">
              {stats.never.length ? (
                <div className="flex flex-wrap gap-2 text-xs">
                  {stats.never.slice(0, 12).map((i) => (
                    <span key={i.id} className="rounded-full border border-border px-3 py-1.5">
                      {i.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Every piece has been worn at least once. Great rotation.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
