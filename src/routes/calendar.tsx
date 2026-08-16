import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, ItemSwatch, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWardrobe, useWearHistory, useWeeklyPlan } from "@/lib/styleai/data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Style Calendar — StyleAI" },
      { name: "description", content: "See what you wore and what's planned." },
      { property: "og:title", content: "Style Calendar — StyleAI" },
      { property: "og:description", content: "See what you wore and what's planned." },
    ],
  }),
  component: Page,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = (first.getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = Array.from({ length: startOffset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function Page() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
  );
  const [selected, setSelected] = useState<string>(iso(today));

  const { data: history = [], isLoading } = useWearHistory();
  const { data: plan } = useWeeklyPlan();
  const { data: wardrobe = [] } = useWardrobe();
  const byId = useMemo(() => new Map(wardrobe.map((i) => [i.id, i])), [wardrobe]);

  const wornByDate = useMemo(() => {
    const map = new Map<string, typeof history>();
    for (const w of history) {
      const key = w.worn_on.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return map;
  }, [history]);

  const plannedByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of plan?.daily_plans ?? []) map.set(d.plan_date.slice(0, 10), d.occasion);
    return map;
  }, [plan]);

  const cells = monthGrid(cursor.getUTCFullYear(), cursor.getUTCMonth());
  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const selectedWorn = wornByDate.get(selected) ?? [];
  const selectedPlanned = plannedByDate.get(selected);

  function shift(delta: number) {
    setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + delta, 1)));
  }

  return (
    <AppShell title="Style Calendar" subtitle="See what you wore and what's planned.">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="surface-card rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold">{monthLabel}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
                  <ChevronLeft className="size-4.5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => shift(1)}>
                  <ChevronRight className="size-4.5" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const key = iso(d);
                const worn = wornByDate.get(key);
                const planned = plannedByDate.get(key);
                const isToday = key === iso(today);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={cn(
                      "relative aspect-square rounded-xl text-sm transition-colors",
                      selected === key
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground",
                      isToday && selected !== key && "ring-1 ring-primary/60",
                    )}
                  >
                    {d.getUTCDate()}
                    <span className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
                      {worn && <span className="size-1.5 rounded-full bg-success" />}
                      {planned && !worn && <span className="size-1.5 rounded-full bg-primary-glow" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" /> Worn
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary-glow" /> Planned
              </span>
            </div>
          </div>

          <section>
            <SectionTitle
              title={new Date(`${selected}T00:00:00Z`).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              })}
              hint={selectedPlanned ? `Planned occasion: ${selectedPlanned}` : "No plan for this day"}
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/planner">Open planner</Link>
                </Button>
              }
            />
            {selectedWorn.length ? (
              <div className="space-y-3">
                {selectedWorn.map((w) => (
                  <div key={w.id} className="surface-card rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{w.occasion ?? "Worn"}</p>
                      <Badge variant="secondary">{w.item_ids.length} pieces</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {w.item_ids.map((id) => {
                        const item = byId.get(id);
                        return (
                          <div
                            key={id}
                            className="aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
                          >
                            {item ? <ItemSwatch item={item} /> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays className="size-5" />}
                title="Nothing logged for this day"
                body="Mark an outfit as worn from the stylist or planner and it will appear on your calendar."
                action={
                  <Button asChild>
                    <Link to="/stylist">Find an outfit</Link>
                  </Button>
                }
              />
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
