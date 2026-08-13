import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Style Profile — StyleAI" },
      { name: "description", content: "Your style preferences, fits and colors." },
      { property: "og:title", content: "Style Profile — StyleAI" },
      { property: "og:description", content: "Your style preferences, fits and colors." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Style Profile" subtitle="Your style preferences, fits and colors.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
