import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/styleai/data";

export const Route = createFileRoute("/try-on")({
  component: TryOnPage,
});

const MAKE_WEBHOOK_URL =
  "https://hook.eu1.make.com/j7snjaigkbwlbtz3ckdtax5s8x7pixhv";

type Outfit = {
  outfit_number: number;
  outfit_name: string;
  clothing: string;
  footwear: string;
  accessories: string;
  hairstyle: string;
  description_for_user: string;
  why_it_suits_her: string;
  image_prompt: string;
};

type MakeResponse = {
  outfits?: Outfit[];
  message?: string;
};

function TryOnPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setOutfits([]);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("That image is too large. Please choose an image under 5 MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);

      setPhoto(dataUrl);
      setPhotoFile(file);
    } catch {
      setError("Could not read that image. Please try another photo.");
    }
  };

  const sendToMake = async () => {
    if (!photoFile) {
      setError("Please upload your photo first.");
      return;
    }

    setBusy(true);
    setError(null);
    setOutfits([]);

    try {
      const formData = new FormData();

      formData.append("file", photoFile, photoFile.name);

      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      console.log("Make HTTP status:", response.status);
      console.log("Make HTTP OK:", response.ok);
      console.log(
        "Make Content-Type:",
        response.headers.get("content-type"),
      );

      const rawText = await response.text();

      console.log("RAW MAKE RESPONSE:", rawText);

      if (!response.ok) {
        throw new Error(
          `Make returned HTTP ${response.status}: ${rawText.substring(0, 500)}`,
        );
      }

      let data: MakeResponse;

      try {
        data = JSON.parse(rawText) as MakeResponse;
      } catch {
        throw new Error(
          `Make returned invalid JSON: ${rawText.substring(0, 500)}`,
        );
      }

      if (!Array.isArray(data.outfits)) {
        throw new Error(
          "Make response does not contain an outfits array.",
        );
      }

      setOutfits(data.outfits);

      toast.success(
        `${data.outfits.length} outfit recommendations received.`,
      );
    } catch (err) {
      console.error("Make webhook error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting Make.";

      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
       <SectionTitle
  title="Find your personalized outfits"
  hint="Upload your photo and our AI will analyze your style profile and create five personalized outfit ideas."
/>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <h2 className="font-semibold">Your photo</h2>
              </div>

              {photo ? (
                <div className="overflow-hidden rounded-xl border">
                  <img
                    src={photo}
                    alt="Uploaded user"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              ) : (
                <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-muted/50">
                  <Camera className="mb-3 h-10 w-10 opacity-60" />

                  <span className="font-medium">
                    Upload your photo
                  </span>

                  <span className="mt-1 text-sm text-muted-foreground">
                    JPG, PNG or WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}

              {photo && (
                <label className="mt-4 block cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <span>Change Photo</span>
                  </Button>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}

              <Button
                type="button"
                className="mt-4 w-full"
                disabled={!photoFile || busy}
                onClick={sendToMake}
              >
                <Sparkles className="mr-2 h-4 w-4" />

                {busy
                  ? "AI is creating your outfits..."
                  : "Generate 5 Outfits"}
              </Button>

              {error && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  AI Outfit Recommendations
                </h2>

                <p className="text-sm text-muted-foreground">
                  Your personalized looks will appear here.
                </p>
              </div>

              {outfits.length > 0 && (
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  {outfits.length} looks
                </span>
              )}
            </div>

            {busy && (
              <div className="rounded-2xl border p-10 text-center">
                <Sparkles className="mx-auto mb-4 h-10 w-10 animate-pulse" />

                <h3 className="font-semibold">
                  Creating your personalized outfits...
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  AI is analyzing your profile and creating five different
                  looks.
                </p>
              </div>
            )}

            {!busy && outfits.length === 0 && !error && (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <Sparkles className="mx-auto mb-4 h-10 w-10 opacity-50" />

                <h3 className="font-semibold">
                  No outfits yet
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your photo and click Generate 5 Outfits.
                </p>
              </div>
            )}

            {!busy && outfits.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.outfit_number}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                  >
                    <div className="border-b bg-muted/30 p-5">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Outfit {outfit.outfit_number}
                      </div>

                      <h3 className="text-lg font-semibold">
                        {outfit.outfit_name}
                      </h3>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <h4 className="text-sm font-semibold">
                          Clothing
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.clothing}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Footwear
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.footwear}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Accessories
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.accessories}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Hairstyle
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.hairstyle}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Why it suits you
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.why_it_suits_her}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold">
                          Style description
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {outfit.description_for_user}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
