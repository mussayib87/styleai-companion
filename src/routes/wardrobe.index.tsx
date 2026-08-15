import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Shirt, Trash2, WashingMachine } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, ItemCard, ItemSwatch, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useDeleteItem,
  useFavorites,
  useSeedDemoWardrobe,
  useToggleFavoriteItem,
  useUpdateItem,
  useWardrobe,
} from "@/lib/styleai/data";
import { CATEGORIES, type WardrobeItem } from "@/lib/styleai/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wardrobe/")({
  head: () => ({
    meta: [
      { title: "My Wardrobe — StyleAI" },
      {
        name: "description",
        content: "Every piece you own, tagged and ready for AI outfit suggestions.",
      },
      { property: "og:title", content: "My Wardrobe — StyleAI" },
      {
        property: "og:description",
        content: "Every piece you own, tagged and ready for AI outfit suggestions.",
      },
    ],
  }),
  component: WardrobePage,
});

const FILTERS = ["All", ...CATEGORIES] as const;

function WardrobePage() {
  const { data: wardrobe, isLoading } = useWardrobe();
  const { data: favorites } = useFavorites();
  const toggleFav = useToggleFavoriteItem();
  const update = useUpdateItem();
  const remove = useDeleteItem();
  const seed = useSeedDemoWardrobe();

  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [laundryOnly, setLaundryOnly] = useState(false);
  const [selected, setSelected] = useState<WardrobeItem | null>(null);

  const items = wardrobe ?? [];
  const favIds = useMemo(
    () => new Set((favorites ?? []).filter((f) => f.kind === "item").map((f) => f.item_id)),
    [favorites],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== "All" && i.category !== filter) return false;
      if (laundryOnly && !i.in_laundry) return false;
      if (q && !`${i.name} ${i.color} ${i.style}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, query, laundryOnly]);

  const inLaundry = items.filter((i) => i.in_laundry).length;

  return (
    <AppShell
      title="My Wardrobe"
      subtitle={`${items.length} pieces · ${inLaundry} in laundry`}
      action={
        <Button asChild size="sm">
          <Link to="/wardrobe/add">
            <Plus className="size-4" /> Add
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search your wardrobe…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <Switch id="laundry" checked={laundryOnly} onCheckedChange={setLaundryOnly} />
            <Label htmlFor="laundry" className="text-sm text-muted-foreground">
              Laundry only
            </Label>
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
            ))}
          </div>
        ) : visible.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                favorite={favIds.has(item.id)}
                onFavorite={() =>
                  toggleFav.mutate({ itemId: item.id, on: !favIds.has(item.id) })
                }
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        ) : items.length ? (
          <EmptyState
            icon={<Shirt className="size-5" />}
            title="Nothing matches those filters"
            body="Try a different category or clear your search to see the rest of your wardrobe."
          />
        ) : (
          <EmptyState
            icon={<Shirt className="size-5" />}
            title="Your wardrobe is empty"
            body="Add your clothes one by one with AI tagging, or load a realistic demo wardrobe to explore StyleAI right away."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to="/wardrobe/add">Add clothes</Link>
                </Button>
                <Button variant="secondary" onClick={() => seed.mutate()} disabled={seed.isPending}>
                  {seed.isPending ? "Loading demo…" : "Load demo wardrobe"}
                </Button>
              </div>
            }
          />
        )}

        {items.length > 0 && (
          <section>
            <SectionTitle title="Laundry basket" hint="Items excluded from outfit suggestions" />
            {inLaundry ? (
              <div className="flex flex-wrap gap-2">
                {items
                  .filter((i) => i.in_laundry)
                  .map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => update.mutate({ id: i.id, patch: { in_laundry: false } })}
                      className="surface-card flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-medium"
                    >
                      <span className="size-6 overflow-hidden rounded-full">
                        <ItemSwatch item={i} />
                      </span>
                      {i.name}
                      <span className="text-muted-foreground">· mark clean</span>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing in the wash — your whole wardrobe is available.
              </p>
            )}
          </section>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <div className="space-y-5">
              <SheetHeader>
                <SheetTitle className="font-display">{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.category} · {selected.color} · {selected.style}
                </SheetDescription>
              </SheetHeader>

              <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border">
                <ItemSwatch item={selected} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.pattern}</Badge>
                <Badge variant="secondary">{selected.fit} fit</Badge>
                <Badge variant="secondary">Formality {selected.formality}/4</Badge>
                <Badge variant="secondary">{selected.season}</Badge>
                {selected.sleeve && <Badge variant="secondary">{selected.sleeve} sleeve</Badge>}
              </div>

              <div className="surface-card rounded-2xl p-4 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Times worn</span>
                  <span className="font-medium">{selected.times_worn}</span>
                </p>
                <p className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Last worn</span>
                  <span className="font-medium">
                    {selected.last_worn_at
                      ? new Date(selected.last_worn_at).toLocaleDateString()
                      : "Never"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    update.mutate({
                      id: selected.id,
                      patch: { in_laundry: !selected.in_laundry },
                    });
                    setSelected({ ...selected, in_laundry: !selected.in_laundry });
                  }}
                >
                  <WashingMachine className="size-4" />
                  {selected.in_laundry ? "Mark clean" : "Send to laundry"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    remove.mutate(selected.id, {
                      onSuccess: () => toast.success("Item removed"),
                    });
                    setSelected(null);
                  }}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
