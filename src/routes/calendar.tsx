import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Style Calendar — StyleAI" },
      { name: "description", content: "See what you wore and what's planned." },
      { property: "og:title", content: "Style Calendar — StyleAI" },
      { property: "og:description", content: "See what you wore and what's planned." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Style Calendar" subtitle="See what you wore and what's planned.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
