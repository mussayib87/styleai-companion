import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Outfit Planner — StyleAI" },
      { name: "description", content: "Plan your outfits for the week ahead with StyleAI." },
      { property: "og:title", content: "Outfit Planner — StyleAI" },
      { property: "og:description", content: "Plan your outfits for the week ahead with StyleAI." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Outfit Planner" subtitle="Plan your outfits for the week ahead with StyleAI.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
