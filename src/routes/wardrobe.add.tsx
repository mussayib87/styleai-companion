import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/styleai/app-shell";

export const Route = createFileRoute("/wardrobe/add")({
  head: () => ({
    meta: [
      { title: "Add Clothes — StyleAI" },
      { name: "description", content: "Snap or upload a photo and let AI tag it." },
      { property: "og:title", content: "Add Clothes — StyleAI" },
      { property: "og:description", content: "Snap or upload a photo and let AI tag it." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Add Clothes" subtitle="Snap or upload a photo and let AI tag it.">
      <div className="surface-card rounded-3xl p-8 text-sm text-muted-foreground">
        This screen is coming next in the build.
      </div>
    </AppShell>
  );
}
