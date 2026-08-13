import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/try-on")({
  head: () => ({
    meta: [
      { title: "AI Try-On — StyleAI" },
      { name: "description", content: "Visualize outfits on yourself with AI try-on." },
      { property: "og:title", content: "AI Try-On — StyleAI" },
      { property: "og:description", content: "Visualize outfits on yourself with AI try-on." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="AI Try-On" subtitle="Visualize outfits on yourself with AI try-on.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
