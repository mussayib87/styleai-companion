import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Shopping Assistant — StyleAI" },
      { name: "description", content: "Check if a new purchase fits your wardrobe." },
      { property: "og:title", content: "Shopping Assistant — StyleAI" },
      { property: "og:description", content: "Check if a new purchase fits your wardrobe." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Shopping Assistant" subtitle="Check if a new purchase fits your wardrobe.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
