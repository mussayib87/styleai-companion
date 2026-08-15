import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Sparkles, ThumbsUp, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { SectionTitle, ThinkingLines } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fileToDataUrl, useAnalyses, useSaveAnalysis } from "@/lib/styleai/data";
import { profileSummary, useStylistContext } from "@/lib/styleai/use-stylist";
import { AIService, summarizeWardrobe } from "@/lib/styleai/ai-service";
import type { ShoppingAnalysis } from "@/lib/ai.server";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Should I Buy It? — StyleAI" },
      {
        name: "description",
        content:
          "Check whether a new purchase actually fits your wardrobe before you spend the money.",
      },
      { property: "og:title", content: "Should I Buy It? — StyleAI" },
      {
        property: "og:description",
        content: "StyleAI compares a product against your real wardrobe and tells you honestly.",
      },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const { items, prefs, profile } = useStylistContext();
  const { data: history } = useAnalyses();
  const saveAnalysis = useSaveAnalysis();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ShoppingAnalysis | null>(null);

  async function analyze() {
    if (!name.trim()) {
      toast.error("What are you thinking of buying?");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await AIService.analyzeShoppingProduct({
        productName: name.trim(),
        ...(url ? { productUrl: url } : {}),
        ...(notes ? { notes } : {}),
        ...(image ? { imageDataUrl: image } : {}),
        wardrobeSummary: summarizeWardrobe(items),
        profileSummary: profileSummary(prefs, profile?.display_name),
      });
      setResult(res);
      saveAnalysis.mutate({
        product_name: res.product_name,
        product_url: url || null,
        image_url: null,
        category: res.category,
        color: res.color,
        compatibility: res.compatibility,
        overlap: res.overlap,
        style_compatibility: res.style_compatibility,
        new_combinations: res.new_combinations,
        occasions: res.occasions,
        reasons: res.reasons,
        concerns: res.concerns,
        pairings: res.pairings,
      });
    } catch {
      toast.error("Couldn't analyse that product right now.");
    } finally {
      setBusy(false);
    }
  }

  const verdict = result
    ? result.compatibility === "High"
      ? { label: "Worth buying", tone: "text-success" }
      : result.compatibility === "Medium"
        ? { label: "Buy with care", tone: "text-warning" }
        : { label: "Probably skip it", tone: "text-destructive" }
    : null;

  return (
    <AppShell title="Shopping Assistant" subtitle="Should you actually buy it? Ask your wardrobe.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="space-y-4">
          <SectionTitle title="The product" hint="Name is enough — a photo helps" />
          <div className="space-y-1.5">
            <Label htmlFor="p-name">What is it?</Label>
            <Input
              id="p-name"
              value={name}
              placeholder="e.g. Beige linen overshirt"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-url">Product link (optional)</Label>
            <Input
              id="p-url"
              value={url}
              placeholder="https://…"
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-notes">Anything else? (optional)</Label>
            <Textarea
              id="p-notes"
              value={notes}
              placeholder="Price, occasion you'd wear it for, size doubts…"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-image">Product photo (optional)</Label>
            <Input
              id="p-image"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setImage(await fileToDataUrl(f));
              }}
            />
          </div>
          <Button onClick={() => void analyze()} disabled={busy}>
            <Sparkles className="size-4" /> {busy ? "Checking your wardrobe…" : "Should I buy it?"}
          </Button>
        </section>

        <section className="space-y-4">
          <SectionTitle title="Verdict" hint="Based on what you already own" />
          {busy ? (
            <ThinkingLines label="Comparing against your wardrobe…" />
          ) : result ? (
            <div className="surface-card rise-in space-y-4 rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{result.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.category} · {result.color}
                  </p>
                </div>
                <p className={`font-display text-base font-semibold ${verdict?.tone}`}>
                  {verdict?.label}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric label="Wardrobe fit" value={result.compatibility} />
                <Metric label="Overlap" value={result.overlap} />
                <Metric label="New looks" value={`+${result.new_combinations}`} />
              </div>

              <div>
                <p className="text-sm font-medium">Why</p>
                <ul className="mt-1.5 space-y-1">
                  {result.reasons.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="mt-0.5 size-3.5 shrink-0 text-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {result.concerns.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Watch out for</p>
                  <ul className="mt-1.5 space-y-1">
                    {result.concerns.map((c) => (
                      <li key={c} className="flex gap-2 text-sm text-muted-foreground">
                        <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.pairings.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Pairs with what you own</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.pairings.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.occasions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Useful for: {result.occasions.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <div className="surface-card grid place-items-center rounded-3xl px-6 py-14 text-center">
              <div className="ai-gradient mb-4 grid size-12 place-items-center rounded-2xl text-primary-foreground">
                <ShoppingBag className="size-5" />
              </div>
              <p className="font-display text-lg font-semibold">No purchase checked yet</p>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Describe something you're tempted by. StyleAI checks overlap with what you own, how
                many new outfits it unlocks and whether it matches your style.
              </p>
            </div>
          )}

          {(history ?? []).length > 0 && (
            <div>
              <SectionTitle title="Previously checked" />
              <div className="space-y-2">
                {(history ?? []).slice(0, 6).map((h) => (
                  <div key={h.id} className="surface-card flex items-center justify-between gap-3 rounded-2xl p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString()} · +{h.new_combinations} looks
                      </p>
                    </div>
                    <Badge variant="secondary">{h.compatibility}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="font-display text-base font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
