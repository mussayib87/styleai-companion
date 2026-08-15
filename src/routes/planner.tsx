import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Shirt } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, OutfitStrip, ScorePill, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarkWorn, useSaveWeeklyPlan } from "@/lib/styleai/data";
import { useStylistContext } from "@/lib/styleai/use-stylist";
import { planWeek, startOfWeek } from "@/lib/styleai/engine";
import { OCCASIONS, type GeneratedOutfit } from "@/lib/styleai/types";
import { Lock, LockOpen } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Weekly Outfit Planner — StyleAI" },
      {
        name: "description",
        content: "Plan a full week of outfits with no repeats, locked favourites and laundry aware.",
      },
      { property: "og:title", content: "Weekly Outfit Planner — StyleAI" },
      {
        property: "og:description",
        content: "A week of outfits planned from your wardrobe, with no repeated looks.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { items, base, routine, loading } = useStylistContext();
  const savePlan = useSaveWeeklyPlan();
  const markWorn = useMarkWorn();

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Record<string, GeneratedOutfit>>({});
  const [seed, setSeed] = useState(0);

  const weekStart = useMemo(() => startOfWeek(), []);
  const effectiveRoutine = useMemo(() => ({ ...routine, ...overrides }), [routine, overrides]);

  const plan = useMemo(
    () => planWeek(items, weekStart, effectiveRoutine, base, locked),
    // seed forces a fresh pass when the user regenerates
    [items, weekStart, effectiveRoutine, base, locked, seed],
  );

  const filled = plan.filter((d) => d.outfit).length;

  return (
    <AppShell
      title="Outfit Planner"
      subtitle={`Week of ${weekStart.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${filled}/7 planned`}
      action={
        <Button
          size="sm"
          disabled={savePlan.isPending || !filled}
          onClick={() =>
            savePlan.mutate(
              plan.map((d) => ({
                date: d.date,
                occasion: d.occasion,
                outfit: d.outfit,
                locked: !!locked[d.date],
              })),
              { onSuccess: () => toast.success("Weekly plan saved") },
            )
          }
        >
          {savePlan.isPending ? "Saving…" : "Save plan"}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSeed((s) => s + 1)}>
            Regenerate unlocked days
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocked({});
              setOverrides({});
            }}
          >
            Reset week
          </Button>
          <Badge variant="secondary">No repeated looks</Badge>
          <Badge variant="secondary">Laundry aware</Badge>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Shirt className="size-5" />}
            title="Add clothes to plan your week"
            body="StyleAI needs a few tops, bottoms and shoes before it can build a repeat-free week."
            action={
              <Button asChild>
                <Link to="/wardrobe/add">Add clothes</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {plan.map((day) => {
              const isLocked = !!locked[day.date];
              return (
                <div key={day.date} className="surface-card rounded-3xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-semibold">{day.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={day.occasion}
                        onValueChange={(v) => setOverrides((o) => ({ ...o, [day.label]: v }))}
                      >
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OCCASIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {day.outfit && (
                        <Button
                          size="icon"
                          variant={isLocked ? "default" : "secondary"}
                          aria-label={isLocked ? "Unlock day" : "Lock day"}
                          onClick={() =>
                            setLocked((l) => {
                              const next = { ...l };
                              if (isLocked) delete next[day.date];
                              else next[day.date] = day.outfit!;
                              return next;
                            })
                          }
                        >
                          {isLocked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {day.outfit ? (
                    <>
                      <div className="mt-3">
                        <OutfitStrip outfit={day.outfit} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-medium">{day.outfit.title}</p>
                        <ScorePill score={day.outfit.score} />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            markWorn.mutate(
                              { outfit: day.outfit!, date: day.date },
                              { onSuccess: () => toast.success(`Logged for ${day.label}`) },
                            )
                          }
                        >
                          Mark worn
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/stylist">Swap in stylist</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="size-4" />
                      Not enough unworn pieces left for this day — add more items or unlock a day.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
