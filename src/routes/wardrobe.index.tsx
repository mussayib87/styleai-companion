import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/wardrobe/")({
  head: () => ({
    meta: [
      { title: "My Wardrobe — StyleAI" },
      { name: "description", content: "Browse, filter and manage your wardrobe items." },
      { property: "og:title", content: "My Wardrobe — StyleAI" },
      { property: "og:description", content: "Browse, filter and manage your wardrobe items." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="My Wardrobe" subtitle="Browse, filter and manage your wardrobe items.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
