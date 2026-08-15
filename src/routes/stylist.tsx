import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Send, Shirt, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import { EmptyState, OutfitCard, SectionTitle, ThinkingLines } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFeedback, useMarkWorn, useSaveOutfit } from "@/lib/styleai/data";
import { profileSummary, useStylistContext } from "@/lib/styleai/use-stylist";
import { AIService, summarizeWardrobe } from "@/lib/styleai/ai-service";
import { generateOutfits } from "@/lib/styleai/engine";
import { OCCASIONS } from "@/lib/styleai/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stylist")({
  head: () => ({
    meta: [
      { title: "AI Stylist — StyleAI" },
      {
        name: "description",
        content: "Ask your AI stylist what to wear and get ranked outfits from your own wardrobe.",
      },
      { property: "og:title", content: "AI Stylist — StyleAI" },
      {
        property: "og:description",
        content: "Ranked outfit ideas and stylist answers based on the clothes you own.",
      },
    ],
  }),
  component: StylistPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const PROMPTS = [
  "What should I wear to college today?",
  "Build me a smart casual look for a dinner",
  "I want something minimal in dark colours",
  "What can I wear that I haven't worn recently?",
];

function StylistPage() {
  const { items, base, prefs, profile, todayOccasion, loading } = useStylistContext();
  const feedback = useFeedback();
  const markWorn = useMarkWorn();
  const saveOutfit = useSaveOutfit();

  const [occasion, setOccasion] = useState<string>(todayOccasion);
  const [round, setRound] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const listEnd = useRef<HTMLDivElement>(null);

  const outfits = useMemo(
    () => generateOutfits(items, { ...base, occasion }, 3 + round * 3).slice(round * 3, round * 3 + 3),
    [items, base, occasion, round],
  );

  async function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setThinking(true);
    try {
      const reply = await AIService.chatWithStylist({
        question: q,
        wardrobeSummary: summarizeWardrobe(items),
        profileSummary: profileSummary(prefs, profile?.display_name),
        planSummary: `Today's occasion: ${occasion}`,
        history: messages.slice(-8),
      });
      setMessages((m) => [...m, { role: "assistant", content: reply.message }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the stylist model just now. The ranked outfits below still come from your real wardrobe.",
        },
      ]);
    } finally {
      setThinking(false);
      requestAnimationFrame(() => listEnd.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <AppShell title="AI Stylist" subtitle="Ranked looks from the clothes you already own.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <SectionTitle title="Occasion" hint="The engine re-ranks instantly" />
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setOccasion(o);
                  setRound(0);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  occasion === o
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <ThinkingLines label="Reading your wardrobe…" />
            ) : outfits.length ? (
              outfits.map((o, i) => (
                <OutfitCard
                  key={o.key}
                  outfit={o}
                  rank={round * 3 + i + 1}
                  onWear={() =>
                    markWorn.mutate({ outfit: o }, { onSuccess: () => toast.success("Logged as worn today") })
                  }
                  onSave={() =>
                    saveOutfit.mutate(
                      { outfit: o, favorite: true },
                      { onSuccess: () => toast.success("Saved to favorites") },
                    )
                  }
                  onLike={() => feedback.mutate({ outfit: o, signal: "like" })}
                  onDislike={() =>
                    feedback.mutate(
                      { outfit: o, signal: "dislike" },
                      { onSuccess: () => toast.message("Noted — I'll show fewer looks like this") },
                    )
                  }
                  onAnother={() => setRound((r) => r + 1)}
                />
              ))
            ) : (
              <EmptyState
                icon={<Shirt className="size-5" />}
                title="Not enough pieces yet"
                body="Add at least one top and one bottom and StyleAI will start building complete looks."
                action={
                  <Button asChild>
                    <Link to="/wardrobe/add">Add clothes</Link>
                  </Button>
                }
              />
            )}
            {outfits.length > 0 && round > 0 && (
              <Button variant="ghost" onClick={() => setRound(0)}>
                Back to best matches
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-col">
          <SectionTitle title="Ask your stylist" hint="Plain language, real wardrobe answers" />
          <div className="surface-card flex min-h-[420px] flex-1 flex-col rounded-3xl p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-primary-glow" /> Try one of these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPTS.map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="cursor-pointer py-1.5"
                        onClick={() => void ask(p)}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {thinking && (
                <p className="text-sm text-primary-glow">StyleAI is thinking through your wardrobe…</p>
              )}
              <div ref={listEnd} />
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(question);
              }}
            >
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What should I wear today?"
              />
              <Button type="submit" size="icon" disabled={thinking} aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
