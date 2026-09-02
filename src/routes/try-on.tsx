import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, ChevronRight, Shirt, Sparkles, Wand2 } from "lucide-react";
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
import type { StyleProfile } from "@/lib/styleai/types";

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
  const [analysisPhoto, setAnalysisPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ imageDataUrl: string | null; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const outfits = useMemo(
    () => generateOutfits(items, { ...base, occasion: todayOccasion }, 6),
    [items, base, todayOccasion],
  );
  const chosen = outfits.find((o) => o.key === selected) ?? outfits[0] ?? null;

  async function optimizeImage(file: File): Promise<string> {
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("image decode failed"));
      });
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  async function selectPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setProfileError("That image is too large. Please choose one under 7 MB.");
      return;
    }
    setProfileError(null);
    setStyleProfile(null);
    try {
      const [previewUrl, optimizedUrl] = await Promise.all([
        fileToDataUrl(file),
        optimizeImage(file),
      ]);
      setPhoto(previewUrl);
      setAnalysisPhoto(optimizedUrl);
    } catch {
      setProfileError("That image could not be prepared. Please choose another photo.");
    }
  }

  async function analyzeProfile() {
    if (!analysisPhoto) return;
    setBusy(true);
    setProfileError(null);
    try {
      const profile = await AIService.analyzeStyleProfile(analysisPhoto);
      setStyleProfile(profile);
      setPhoto(null);
      setAnalysisPhoto(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setProfileError(
        message.includes("GEMINI_OVERLOADED")
          ? "Gemini is temporarily busy. Please try again in a moment."
          : message.includes("GEMINI_RATE_LIMITED")
            ? "Gemini is temporarily busy due to request limits. Please try again shortly."
            : message.includes("GEMINI_AUTH_ERROR")
              ? "The Gemini API configuration needs attention."
              : message.includes("GEMINI_BAD_REQUEST")
                ? "The photo could not be processed. Please try another clear photo."
                : message.includes("GEMINI_TIMEOUT")
                  ? "Style analysis is taking longer than expected. Please try again."
                  : message.includes("GEMINI_NOT_CONFIGURED")
                    ? "Style analysis is not configured yet. Please add GEMINI_API_KEY on the server."
                    : message.includes("INVALID_IMAGE")
                      ? "That image could not be read. Please choose another photo."
                      : message.includes("too large")
                        ? "That image is too large. Please choose a smaller photo."
                        : "We couldn't analyze that photo right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

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

  return (
    <AppShell
      title="AI Try-On"
      subtitle="Discover your style and preview outfits from your wardrobe."
    >
      <section className="surface-card rounded-3xl p-5 sm:p-7">
        {styleProfile ? (
          <StyleProfileResult
            profile={styleProfile}
            onChooseAnother={() => setStyleProfile(null)}
          />
        ) : (
          <div className="max-w-2xl">
            <SectionTitle
              title="Let's discover your style"
              hint="A clear full-body photo is helpful, but not required."
            />
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Upload a clear photo of yourself and StyleAI will create your personalized style
              profile.
            </p>
            <label className="surface-card relative mt-5 grid aspect-[4/3] w-full max-w-md cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed text-center">
              {photo ? (
                <img
                  src={photo}
                  alt="Selected style profile photo"
                  className="size-full object-cover"
                />
              ) : (
                <div className="px-6">
                  <div className="ai-gradient mx-auto grid size-12 place-items-center rounded-2xl text-primary-foreground">
                    <Camera className="size-5" />
                  </div>
                  <p className="mt-4 font-display text-base font-semibold">Upload Photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void selectPhoto(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {profileError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {profileError}
              </p>
            )}
            <Button
              className="mt-5"
              disabled={!photo || busy}
              onClick={() => void analyzeProfile()}
            >
              <Sparkles className="size-4" /> {busy ? "Analyzing your style…" : "Proceed"}
            </Button>
          </div>
        )}
      </section>

      {!items.length ? (
        <EmptyState
          icon={<Shirt className="size-5" />}
          title="Add clothes to try outfits"
          body="Your style profile is ready. Add a few wardrobe pieces when you want to preview complete looks."
          action={
            <Button asChild>
              <Link to="/wardrobe/add">Add clothes</Link>
            </Button>
          }
        />
      ) : (
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

            <Button
              className="w-full"
              disabled={!photo || !chosen || busy}
              onClick={() => void run()}
            >
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
                <img
                  src={result.imageDataUrl}
                  alt="AI try-on preview"
                  className="size-full object-cover"
                />
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
      )}
    </AppShell>
  );
}

function StyleProfileResult({
  profile,
  onChooseAnother,
}: {
  profile: StyleProfile;
  onChooseAnother: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            StyleAI analysis
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Your Style Profile</h2>
        </div>
        <Button variant="outline" onClick={onChooseAnother}>
          Choose another photo
        </Button>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">{profile.summary}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ProfileList title="Best Colors" values={profile.best_colors} />
        <ProfileList title="Recommended Fits" values={profile.recommended_fits} />
        <ProfileList title="Best Silhouettes" values={profile.recommended_silhouettes} />
        <ProfileList title="Recommended Styles" values={profile.recommended_styles} />
      </div>
      <div className="mt-6">
        <h3 className="font-display text-lg font-semibold">Recommended Clothing</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {profile.recommended_items.map((item) => (
            <div
              key={`${item.category}-${item.item}`}
              className="rounded-2xl border border-border p-4"
            >
              <p className="font-medium">{item.item}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.category} · {item.color} · {item.fit}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
      <Button
        className="mt-6"
        disabled
        onClick={() => toast.message("Outfit recommendations are coming next.")}
      >
        See Outfit Recommendations <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function ProfileList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {values.join(" · ") || "No clear recommendation"}
      </p>
    </div>
  );
}
