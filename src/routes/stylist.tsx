import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/stylist")({
  head: () => ({
    meta: [
      { title: "AI Stylist — StyleAI" },
      { name: "description", content: "Chat with your AI personal stylist about what to wear." },
      { property: "og:title", content: "AI Stylist — StyleAI" },
      { property: "og:description", content: "Chat with your AI personal stylist about what to wear." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="AI Stylist" subtitle="Chat with your AI personal stylist about what to wear.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
