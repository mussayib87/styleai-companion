import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

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
  return (
    <AppShell title="Favorites" subtitle="Your saved outfits and favorite wardrobe pieces.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
