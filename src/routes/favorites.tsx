import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Heart, HeartOff, Shirt } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/styleai/app-shell";
import {
  EmptyState,
  ItemCard,
  ItemSwatch,
  ScorePill,
  SectionTitle,
} from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFavorites,
  useSavedOutfits,
  useToggleFavoriteItem,
  useToggleFavoriteOutfit,
  useWardrobe,
} from "@/lib/styleai/data";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — StyleAI" },
      {
        name: "description",
        content: "Every outfit and wardrobe piece you saved, ready to wear again.",
      },
      { property: "og:title", content: "Favorites — StyleAI" },
      {
        property: "og:description",
        content: "Every outfit and wardrobe piece you saved, ready to wear again.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const favoritesQ = useFavorites();
  const wardrobeQ = useWardrobe();
  const outfitsQ = useSavedOutfits();
  const toggleFavItem = useToggleFavoriteItem();
  const toggleFavOutfit = useToggleFavoriteOutfit();

  const favorites = favoritesQ.data ?? [];
  const wardrobe = wardrobeQ.data ?? [];
  const outfits = outfitsQ.data ?? [];

  const loading = favoritesQ.isLoading || outfitsQ.isLoading || wardrobeQ.isLoading;
  const error = favoritesQ.error ?? outfitsQ.error ?? wardrobeQ.error;

  const favItemIds = new Set(
    favorites.filter((f) => f.kind === "item" && f.item_id).map((f) => f.item_id as string),
  );
  const favOutfitIds = new Set(
    favorites.filter((f) => f.kind === "outfit" && f.outfit_id).map((f) => f.outfit_id as string),
  );
  const favItems = wardrobe.filter((i) => favItemIds.has(i.id));
  const favOutfits = outfits.filter((o) => favOutfitIds.has(o.id));
  const byId = new Map(wardrobe.map((i) => [i.id, i]));

  const retry = () => {
    void favoritesQ.refetch();
    void outfitsQ.refetch();
    void wardrobeQ.refetch();
  };

  const removeOutfit = (id: string) =>
    toggleFavOutfit.mutate(
      { outfitId: id, on: false },
      {
        onSuccess: () => toast.success("Removed from favorites"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update favorites"),
      },
    );

  const removeItem = (id: string) =>
    toggleFavItem.mutate(
      { itemId: id, on: false },
      {
        onSuccess: () => toast.success("Removed from favorites"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update favorites"),
      },
    );

  return (
    <AppShell title="Favorites" subtitle="Your saved outfits and favorite wardrobe pieces.">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="We couldn't load your favorites"
          body={
            error instanceof Error
              ? error.message
              : "Something went wrong reading your saved outfits and pieces."
          }
          action={<Button onClick={retry}>Try again</Button>}
        />
      ) : !favItems.length && !favOutfits.length ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Nothing saved yet"
          body="Tap the heart on a wardrobe piece, or save an outfit from the AI Stylist, and it will show up here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/stylist">Get outfit ideas</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/wardrobe">Browse wardrobe</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <Tabs defaultValue={favOutfits.length ? "outfits" : "items"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="outfits">Outfits ({favOutfits.length})</TabsTrigger>
            <TabsTrigger value="items">Pieces ({favItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="outfits">
            {favOutfits.length === 0 ? (
              <EmptyState
                icon={<Heart className="size-5" />}
                title="No saved outfits"
                body="Save a look from the AI Stylist to keep it here."
                action={
                  <Button asChild>
                    <Link to="/stylist">Open AI Stylist</Link>
                  </Button>
                }
              />
            ) : (
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
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={toggleFavOutfit.isPending}
                          onClick={() => removeOutfit(o.id)}
                        >
                          <HeartOff className="size-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="items">
            {favItems.length === 0 ? (
              <EmptyState
                icon={<Shirt className="size-5" />}
                title="No favorite pieces"
                body="Tap the heart on any wardrobe item to pin it here."
                action={
                  <Button asChild>
                    <Link to="/wardrobe">Browse wardrobe</Link>
                  </Button>
                }
              />
            ) : (
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
                      onFavorite={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}
