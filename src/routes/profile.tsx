import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/styleai/app-shell";
import { SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ROUTINE,
  useProfile,
  usePrefs,
  useSavePrefs,
  useUpdateProfile,
} from "@/lib/styleai/data";
import { COLOR_OPTIONS, FITS, OCCASIONS, STYLES } from "@/lib/styleai/types";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary-glow"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Page() {
  const { data: profile, isLoading } = useProfile();
  const { data: prefs, isLoading: prefsLoading } = usePrefs();
  const updateProfile = useUpdateProfile();
  const savePrefs = useSavePrefs();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [fit, setFit] = useState<string>("regular");
  const [routine, setRoutine] = useState<Record<string, string>>(DEFAULT_ROUTINE);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setCity(profile.city ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (prefs) {
      setStyles(prefs.styles ?? []);
      setColors(prefs.colors ?? []);
      setOccasions(prefs.occasions ?? []);
      setFit(prefs.fit ?? "regular");
      setRoutine({ ...DEFAULT_ROUTINE, ...(prefs.routine ?? {}) });
    }
  }, [prefs]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function save() {
    try {
      await updateProfile.mutateAsync({ display_name: name || null, city: city || null });
      await savePrefs.mutateAsync({ styles, colors, occasions, fit, routine });
      toast.success("Style profile updated — your suggestions will adapt.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your profile");
    }
  }

  const busy = updateProfile.isPending || savePrefs.isPending;

  if (isLoading || prefsLoading) {
    return (
      <AppShell title="Style Profile" subtitle="Your style preferences, fits and colors.">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Style Profile"
      subtitle="Your style preferences, fits and colors."
      action={
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className="space-y-8 pb-4">
        <section className="surface-card rounded-3xl p-5">
          <SectionTitle title="About you" hint="Used for greetings and weather-aware styling." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="surface-card rounded-3xl p-5">
          <SectionTitle title="Preferred styles" hint="The stylist leans towards these." />
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip
                key={s}
                label={s}
                active={styles.includes(s)}
                onClick={() => toggle(styles, s, setStyles)}
              />
            ))}
          </div>
        </section>

        <section className="surface-card rounded-3xl p-5">
          <SectionTitle title="Favourite colours" hint="Outfits with these score higher." />
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                active={colors.includes(c)}
                onClick={() => toggle(colors, c, setColors)}
              />
            ))}
          </div>
        </section>

        <section className="surface-card rounded-3xl p-5">
          <SectionTitle title="Fit & occasions" hint="How you like clothes to sit, and where you go." />
          <div className="max-w-xs space-y-1.5">
            <Label>Preferred fit</Label>
            <Select value={fit} onValueChange={setFit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FITS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={occasions.includes(o)}
                onClick={() => toggle(occasions, o, setOccasions)}
              />
            ))}
          </div>
        </section>

        <section className="surface-card rounded-3xl p-5">
          <SectionTitle title="Weekly routine" hint="Drives the default occasion for each day." />
          <div className="grid gap-3 sm:grid-cols-2">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{d}</span>
                <Select
                  value={routine[d] ?? "Casual"}
                  onValueChange={(v) => setRoutine({ ...routine, [d]: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </section>

        <Button onClick={save} disabled={busy} className="w-full sm:hidden">
          {busy ? "Saving…" : "Save style profile"}
        </Button>
      </div>
    </AppShell>
  );
}
