import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fileToDataUrl, uploadImage, useAddItems } from "@/lib/styleai/data";
import { AIService } from "@/lib/styleai/ai-service";
import { CATEGORIES, COLOR_OPTIONS, FITS, PATTERNS, STYLES } from "@/lib/styleai/types";

export const Route = createFileRoute("/wardrobe/add")({
  head: () => ({
    meta: [
      { title: "Add clothes — StyleAI" },
      {
        name: "description",
        content: "Snap or upload a photo and let StyleAI tag the garment automatically.",
      },
      { property: "og:title", content: "Add clothes — StyleAI" },
      {
        property: "og:description",
        content: "Snap or upload a photo and let StyleAI tag the garment automatically.",
      },
    ],
  }),
  component: AddItemPage,
});

type Draft = {
  name: string;
  category: string;
  color: string;
  pattern: string;
  style: string;
  fit: string;
  sleeve: string;
  season: string;
  formality: number;
};

const EMPTY: Draft = {
  name: "",
  category: "Shirts",
  color: "White",
  pattern: "solid",
  style: "Casual",
  fit: "regular",
  sleeve: "full",
  season: "all",
  formality: 2,
};

function AddItemPage() {
  const navigate = useNavigate();
  const add = useAddItems();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [addAnother, setAddAnother] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onFile(f: File) {
    setFile(f);
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    setScanning(true);
    setConfidence(null);
    try {
      const a = await AIService.analyzeClothingImage(dataUrl);
      setDraft((d) => ({
        ...d,
        name: a.name || d.name,
        category: CATEGORIES.includes(a.category as never) ? a.category : d.category,
        color: a.color || d.color,
        pattern: a.pattern || d.pattern,
        style: a.style || d.style,
        fit: a.fit || d.fit,
        sleeve: a.sleeve ?? d.sleeve,
        formality: a.formality || d.formality,
      }));
      setConfidence(a.mocked ? "demo" : a.confidence);
      toast.success(a.mocked ? "Demo tagging applied — adjust as needed" : "Garment recognised");
    } catch {
      toast.error("Couldn't analyse that photo — fill the details manually.");
    } finally {
      setScanning(false);
    }
  }

  async function save() {
    if (!draft.name.trim()) {
      toast.error("Give the item a name");
      return;
    }
    let image_url: string | null = null;
    if (file) {
      try {
        const up = await uploadImage("wardrobe", file);
        image_url = up.url;
      } catch {
        toast.message("Photo couldn't be stored — saving the item without it.");
      }
    }
    await add.mutateAsync([
      {
        name: draft.name.trim(),
        category: draft.category,
        color: draft.color,
        pattern: draft.pattern,
        style: draft.style,
        fit: draft.fit,
        sleeve: draft.sleeve || null,
        season: draft.season,
        formality: draft.formality,
        image_url,
      },
    ]);
    toast.success(`${draft.name} added to your wardrobe`);
    if (addAnother) {
      setDraft(EMPTY);
      setFile(null);
      setPreview(null);
      setConfidence(null);
      return;
    }
    navigate({ to: "/wardrobe" });
  }

  return (
    <AppShell title="Add clothes" subtitle="AI tags the garment — you stay in control.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle title="Photo" hint="Optional, but it powers AI recognition" />
          <label className="surface-card relative grid aspect-4/5 w-full cursor-pointer place-items-center overflow-hidden rounded-3xl text-center">
            {preview ? (
              <img src={preview} alt="Garment preview" className="size-full object-cover" />
            ) : (
              <div className="px-6">
                <div className="ai-gradient mx-auto grid size-12 place-items-center rounded-2xl text-primary-foreground">
                  <Camera className="size-5" />
                </div>
                <p className="mt-4 font-display text-base font-semibold">Add a photo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your camera or pick a file. StyleAI will detect category, colour, pattern and
                  formality.
                </p>
              </div>
            )}
            {scanning && (
              <div className="shimmer absolute inset-0 grid place-items-center bg-background/70">
                <p className="flex items-center gap-2 text-sm font-medium text-primary-glow">
                  <Sparkles className="size-4" /> Analysing garment…
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
          </label>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Upload className="size-3" /> JPG / PNG
            </Badge>
            {confidence && (
              <Badge variant="secondary">
                {confidence === "demo" ? "Demo tagging" : `AI confidence: ${confidence}`}
              </Badge>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle title="Details" hint="Everything the outfit engine needs" />
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={draft.name}
              placeholder="e.g. White Oxford Shirt"
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Picker value={draft.category} onChange={(v) => set("category", v)} options={[...CATEGORIES]} />
            </Field>
            <Field label="Colour">
              <Picker value={draft.color} onChange={(v) => set("color", v)} options={[...COLOR_OPTIONS]} />
            </Field>
            <Field label="Pattern">
              <Picker value={draft.pattern} onChange={(v) => set("pattern", v)} options={[...PATTERNS]} />
            </Field>
            <Field label="Style">
              <Picker value={draft.style} onChange={(v) => set("style", v)} options={[...STYLES]} />
            </Field>
            <Field label="Fit">
              <Picker value={draft.fit} onChange={(v) => set("fit", v)} options={[...FITS]} />
            </Field>
            <Field label="Sleeve">
              <Picker
                value={draft.sleeve}
                onChange={(v) => set("sleeve", v)}
                options={["full", "short", "none"]}
              />
            </Field>
            <Field label="Season">
              <Picker
                value={draft.season}
                onChange={(v) => set("season", v)}
                options={["all", "summer", "winter", "monsoon"]}
              />
            </Field>
            <Field label="Formality">
              <Picker
                value={String(draft.formality)}
                onChange={(v) => set("formality", Number(v))}
                options={["1", "2", "3", "4"]}
              />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="another" checked={addAnother} onCheckedChange={setAddAnother} />
            <Label htmlFor="another" className="text-sm text-muted-foreground">
              Keep adding more items
            </Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => void save()} disabled={add.isPending || scanning}>
              {add.isPending ? "Saving…" : "Save to wardrobe"}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: "/wardrobe" })}>
              Cancel
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
