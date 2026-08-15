import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, Shirt, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, OutfitStrip, ScorePill, SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fileToDataUrl } from "@/lib/styleai/data";
import { useStylistContext } from "@/lib/styleai/use-stylist";
import { AIService } from "@/lib/styleai/ai-service";
import { generateOutfits } from "@/lib/styleai/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/try-on")({
  head: () => ({
    meta: [
      { title: "AI Try-On — StyleAI" },
      {
        name: "description",
        content: "Preview how an outfit from your wardrobe looks on you with AI try-on.",
      },
      { property: "og:title", content: "AI Try-On — StyleAI" },
      {
        property: "og:description",
        content: "Upload one photo and preview outfits from your own wardrobe.",
      },
    ],
  }),
  component: TryOnPage,
});

function TryOnPage() {
  const { items, base, todayOccasion } = useStylistContext();
  const [photo, setPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ imageDataUrl: string | null; note: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const outfits = useMemo(
    () => generateOutfits(items, { ...base, occasion: todayOccasion }, 6),
    [items, base, todayOccasion],
  );
  const chosen = outfits.find((o) => o.key === selected) ?? outfits[0] ?? null;

  async function run() {
    if (!photo || !chosen) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await AIService.generateTryOn({
        personImageDataUrl: photo,
        outfitDescription: chosen.pieces
          .map((p) => `${p.item.color} ${p.item.name} (${p.item.category}, ${p.item.fit} fit)`)
          .join(", "),
      });
      setResult(res);
      if (!res.imageDataUrl) toast.message("Try-on preview isn't available in demo mode.");
    } catch {
      toast.error("Try-on failed. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <AppShell title="AI Try-On" subtitle="Preview outfits on yourself.">
        <EmptyState
          icon={<Shirt className="size-5" />}
          title="Add clothes first"
          body="Try-on works with outfits built from your own wardrobe, so add a few pieces to get started."
          action={
            <Button asChild>
              <Link to="/wardrobe/add">Add clothes</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="AI Try-On" subtitle="One photo, outfits from your own wardrobe.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <SectionTitle title="Your photo" hint="Full-body works best. Stored privately." />
          <label className="surface-card relative grid aspect-3/4 w-full cursor-pointer place-items-center overflow-hidden rounded-3xl text-center">
            {photo ? (
              <img src={photo} alt="Your uploaded photo" className="size-full object-cover" />
            ) : (
              <div className="px-6">
                <div className="ai-gradient mx-auto grid size-12 place-items-center rounded-2xl text-primary-foreground">
                  <Camera className="size-5" />
                </div>
                <p className="mt-4 font-display text-base font-semibold">Upload a photo of you</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Only used to render your try-on preview. Your face and body stay unchanged.
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(await fileToDataUrl(f));
              }}
            />
          </label>

          <SectionTitle title="Pick an outfit" hint="Ranked for today" />
          <div className="space-y-2">
            {outfits.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setSelected(o.key)}
                className={cn(
                  "surface-card w-full rounded-2xl p-3 text-left transition-colors",
                  chosen?.key === o.key && "shadow-[inset_0_0_0_1.5px_var(--color-primary)]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{o.title}</p>
                  <ScorePill score={o.score} />
                </div>
                <div className="mt-2">
                  <OutfitStrip outfit={o} />
                </div>
              </button>
            ))}
          </div>

          <Button className="w-full" disabled={!photo || !chosen || busy} onClick={() => void run()}>
            <Wand2 className="size-4" /> {busy ? "Generating preview…" : "Generate try-on"}
          </Button>
        </section>

        <section className="space-y-4">
          <SectionTitle title="Preview" hint="AI-generated — fit may vary" />
          <div className="surface-card grid aspect-3/4 place-items-center overflow-hidden rounded-3xl p-6 text-center">
            {busy ? (
              <p className="flex items-center gap-2 text-sm font-medium text-primary-glow">
                <Sparkles className="size-4" /> Dressing your photo…
              </p>
            ) : result?.imageDataUrl ? (
              <img src={result.imageDataUrl} alt="AI try-on preview" className="size-full object-cover" />
            ) : (
              <div>
                <p className="font-display text-base font-semibold">No preview yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your photo, pick one of the ranked outfits, then generate a preview.
                </p>
              </div>
            )}
          </div>
          <Badge variant="secondary">
            {result?.note ?? "AI-generated preview — actual fit and appearance may vary."}
          </Badge>
        </section>
      </div>
    </AppShell>
  );
}
