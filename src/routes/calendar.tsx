import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Sparkles } from "lucide-react";
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
    <AppShell
      title="Style Calendar"
      subtitle="Your wardrobe rhythm, one considered look at a time."
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : (
        <div className="calendar-page space-y-7 pb-4">
          <div className="calendar-intro flex flex-col justify-between gap-5 rounded-3xl p-5 sm:flex-row sm:items-end sm:p-7">
            <div>
              <p className="calendar-eyebrow">WARDROBE / RHYTHM</p>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Plan the feeling,
                <br />
                then wear the look.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Revisit the pieces that made your days, and keep your next look in view.
              </p>
            </div>
            <div className="calendar-month-control flex items-center justify-between gap-3 rounded-2xl border border-border/80 p-2 sm:min-w-[220px]">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => shift(-1)}
              >
                <ChevronLeft className="size-4.5" />
              </Button>
              <p className="font-display text-sm font-semibold tracking-wide">{monthLabel}</p>
              <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => shift(1)}>
                <ChevronRight className="size-4.5" />
              </Button>
            </div>
          </div>

          <div className="surface-card rounded-3xl p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">
                  Monthly edit
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a date to open its wardrobe story.
                </p>
              </div>
              <div className="hidden items-center gap-4 text-[11px] text-muted-foreground sm:flex">
                <CalendarLegend color="bg-primary" label="Selected" />
                <CalendarLegend color="bg-success" label="Worn" />
                <CalendarLegend color="bg-primary-glow" label="Planned" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:gap-2 sm:text-[11px]">
              {WEEKDAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
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
                      "calendar-day relative aspect-square rounded-2xl border border-transparent text-sm transition-all duration-200",
                      selected === key
                        ? "calendar-day-selected bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_var(--color-primary)]"
                        : "text-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/70",
                      isToday &&
                        selected !== key &&
                        "calendar-day-today border-primary/50 bg-primary/10",
                    )}
                  >
                    <span className="absolute left-2 top-2 text-[9px] font-semibold uppercase tracking-wider opacity-60 sm:left-3 sm:top-3 sm:text-[10px]">
                      {isToday ? "Today" : d.getUTCDate()}
                    </span>
                    <span className="absolute inset-x-0 bottom-2 flex justify-center gap-1 sm:bottom-3">
                      {worn && (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            selected === key ? "bg-primary-foreground" : "bg-success",
                          )}
                        />
                      )}
                      {planned && !worn && (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            selected === key ? "bg-primary-foreground" : "bg-primary-glow",
                          )}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-4 text-[11px] text-muted-foreground sm:hidden">
              <CalendarLegend color="bg-success" label="Worn" />
              <CalendarLegend color="bg-primary-glow" label="Planned" />
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:items-start">
            <div>
              <SectionTitle
                title={new Date(`${selected}T00:00:00Z`).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                })}
                hint={
                  selectedPlanned ? `Planned occasion: ${selectedPlanned}` : "No plan for this day"
                }
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/planner">Open planner</Link>
                  </Button>
                }
              />
              {selectedWorn.length ? (
                <div className="space-y-4">
                  {selectedWorn.map((w) => (
                    <div
                      key={w.id}
                      className="calendar-look-card surface-card overflow-hidden rounded-3xl"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-glow">
                            Worn look
                          </p>
                          <p className="mt-1 font-display text-lg font-semibold">
                            {w.occasion ?? "Everyday edit"}
                          </p>
                        </div>
                        <Badge variant="secondary">{w.item_ids.length} pieces</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-px bg-border/70 sm:grid-cols-6">
                        {w.item_ids.map((id) => {
                          const item = byId.get(id);
                          return (
                            <div
                              key={id}
                              className="calendar-look-piece aspect-square overflow-hidden bg-card p-1.5 sm:p-2"
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
            </div>
            <aside className="calendar-side-panel surface-card rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-2 text-primary-glow">
                {selected === iso(today) ? (
                  <Sparkles className="size-4" />
                ) : (
                  <Clock3 className="size-4" />
                )}
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {selected === iso(today) ? "Today's look" : "Planned look"}
                </p>
              </div>
              <h3 className="mt-4 font-display text-2xl font-medium">
                {selectedPlanned ??
                  (selectedWorn.length ? "A look from your rotation" : "A quiet day in the edit")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedPlanned
                  ? "Your planner has an occasion set for this date. Open it to refine the full look."
                  : selectedWorn.length
                    ? "Pieces from this look are shown in the calendar story beside it."
                    : "Give this date a point of view by choosing an outfit from your stylist."}
              </p>
              <div className="mt-6 border-t border-border/70 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Date signal
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Worn pieces</span>
                  <span className="font-semibold">
                    {selectedWorn.reduce((total, entry) => total + entry.item_ids.length, 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Calendar status</span>
                  <span className="font-semibold text-primary-glow">
                    {selectedPlanned ? "Planned" : selectedWorn.length ? "Worn" : "Open"}
                  </span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function CalendarLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", color)} /> {label}
    </span>
  );
}
