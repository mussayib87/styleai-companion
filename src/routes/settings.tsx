import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StyleAI" },
      { name: "description", content: "Manage your StyleAI account and reminders." },
      { property: "og:title", content: "Settings — StyleAI" },
      { property: "og:description", content: "Manage your StyleAI account and reminders." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Settings" subtitle="Manage your StyleAI account and reminders.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
