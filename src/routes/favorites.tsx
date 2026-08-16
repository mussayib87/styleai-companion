import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Shirt } from "lucide-react";
import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, ItemCard, ItemSwatch, ScorePill, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFavorites,
  useSavedOutfits,
  useToggleFavoriteItem,
  useWardrobe,
} from "@/lib/styleai/data";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — StyleAI" },
      { name: "description", content: "Your saved outfits and favorite wardrobe pieces." },
      { property: "og:title", content: "Favorites — StyleAI" },
      { property: "og:description", content: "Your saved outfits and favorite wardrobe pieces." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: favorites = [], isLoading: favLoading } = useFavorites();
  const { data: wardrobe = [] } = useWardrobe();
  const { data: outfits = [], isLoading: outfitsLoading } = useSavedOutfits();
  const toggleFav = useToggleFavoriteItem();

  const favItemIds = new Set(
    favorites.filter((f) => f.kind === "item" && f.item_id).map((f) => f.item_id as string),
  );
  const favOutfitIds = new Set(
    favorites.filter((f) => f.kind === "outfit" && f.outfit_id).map((f) => f.outfit_id as string),
  );
  const favItems = wardrobe.filter((i) => favItemIds.has(i.id));
  const favOutfits = outfits.filter((o) => favOutfitIds.has(o.id));
  const byId = new Map(wardrobe.map((i) => [i.id, i]));

  const loading = favLoading || outfitsLoading;

  return (
    <AppShell title="Favorites" subtitle="Your saved outfits and favorite wardrobe pieces.">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : !favItems.length && !favOutfits.length ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Nothing saved yet"
          body="Tap the heart on a wardrobe piece, or save an outfit from the AI Stylist, and it will show up here."
          action={
            <Button asChild>
              <Link to="/stylist">Get outfit ideas</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {favOutfits.length > 0 && (
            <section>
              <SectionTitle
                title="Saved outfits"
                hint={`${favOutfits.length} combination${favOutfits.length === 1 ? "" : "s"}`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {favOutfits.map((o) => (
                  <div key={o.id} className="surface-card rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{o.occasion}</p>
                      </div>
                      <ScorePill score={o.match_score} />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {o.outfit_items.map((oi) => {
                        const item = byId.get(oi.item_id);
                        return (
                          <div
                            key={oi.id}
                            className="aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
                          >
                            {item ? <ItemSwatch item={item} /> : null}
                          </div>
                        );
                      })}
                    </div>
                    {o.notes && (
                      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{o.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {favItems.length > 0 && (
            <section>
              <SectionTitle
                title="Favorite pieces"
                hint={`${favItems.length} item${favItems.length === 1 ? "" : "s"}`}
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/wardrobe">
                      <Shirt className="size-4" /> Wardrobe
                    </Link>
                  </Button>
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {favItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    favorite
                    onFavorite={() => toggleFav.mutate({ itemId: item.id, on: false })}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
