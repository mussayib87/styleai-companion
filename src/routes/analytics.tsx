import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

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

function Page() {
  return (
    <AppShell title="Wardrobe Analytics" subtitle="Cost per wear, most-worn pieces and gaps.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
