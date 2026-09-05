import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Send, Shirt, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/styleai/app-shell";
import {
  EmptyState,
  OutfitCard,
  SectionTitle,
  ThinkingLines,
} from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useFeedback,
  useMarkWorn,
  useSaveOutfit,
} from "@/lib/styleai/data";
import {
  profileSummary,
  useStylistContext,
} from "@/lib/styleai/use-stylist";
import {
  AIService,
  summarizeWardrobe,
} from "@/lib/styleai/ai-service";
import { generateOutfits } from "@/lib/styleai/engine";
import { OCCASIONS } from "@/lib/styleai/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stylist")({
  head: () => ({
    meta: [
      {
        title: "AI Stylist — StyleAI",
      },
      {
        name: "description",
        content:
          "Ask your AI stylist what to wear and get ranked outfits from your own wardrobe.",
      },
      {
        property: "og:title",
        content: "AI Stylist — StyleAI",
      },
      {
        property: "og:description",
        content:
          "Ranked outfit ideas and stylist answers based on the clothes you own.",
      },
    ],
  }),
  component: StylistPage,
});

type Msg = {
  role: "user" | "assistant";
  content: string;
};

const PROMPTS = [
  "What should I wear to college today?",
  "Build me a smart casual look for a dinner",
  "I want something minimal in dark colours",
  "What can I wear that I haven't worn recently?",
];

function StylistPage() {
  const {
    items,
    base,
    prefs,
    profile,
    todayOccasion,
    loading,
  } = useStylistContext();

  const feedback = useFeedback();
  const markWorn = useMarkWorn();
  const saveOutfit = useSaveOutfit();

  const [occasion, setOccasion] =
    useState<string>(todayOccasion);

  const [round, setRound] = useState(0);

  const [messages, setMessages] =
    useState<Msg[]>([]);

  const [question, setQuestion] =
    useState("");

  const [thinking, setThinking] =
    useState(false);

  const listEnd =
    useRef<HTMLDivElement>(null);

  /**
   * Generate one stable recommendation pool.
   *
   * We do NOT generate 3 outfits, then regenerate another 3.
   * We generate the entire available pool and simply reveal
   * the next three.
   *
   * Because the engine guarantees unique database IDs across
   * its returned results, the same exact wardrobe item cannot
   * appear in two different rounds.
   */
  const outfitPool = useMemo(() => {
    if (!items.length) {
      return [];
    }

    const maxOutfits = Math.max(
      30,
      items.length * 3,
    );

    return generateOutfits(
      items,
      {
        ...base,
        occasion,
      },
      maxOutfits,
    );
  }, [items, base, occasion]);

  const outfits = useMemo(() => {
    const start = round * 3;

    return outfitPool.slice(
      start,
      start + 3,
    );
  }, [outfitPool, round]);

  const hasMore = useMemo(
    () =>
      (round + 1) * 3 <
      outfitPool.length,
    [round, outfitPool.length],
  );

  async function ask(text: string) {
    const q = text.trim();

    if (!q) return;

    setQuestion("");

    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: q,
      },
    ]);

    setThinking(true);

    try {
      const reply =
        await AIService.chatWithStylist({
          question: q,
          wardrobeSummary:
            summarizeWardrobe(items),
          profileSummary:
            profileSummary(
              prefs,
              profile?.display_name,
            ),
          planSummary:
            `Today's occasion: ${occasion}`,
          history:
            messages.slice(-8),
        });

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: reply.message,
        },
      ]);
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

      requestAnimationFrame(() =>
        listEnd.current?.scrollIntoView({
          behavior: "smooth",
        }),
      );
    }
  }

  function changeOccasion(
    nextOccasion: string,
  ) {
    setOccasion(nextOccasion);

    // Start again from the best three for
    // the newly selected occasion.
    setRound(0);
  }

  return (
    <AppShell
      title="AI Stylist"
      subtitle="Ranked looks from the clothes you already own."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <SectionTitle
            title="Occasion"
            hint="The engine re-ranks instantly"
          />

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() =>
                  changeOccasion(o)
                }
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
              <>
                {outfits.map((outfit, index) => (
                  <OutfitCard
                    key={outfit.key}
                    outfit={outfit}
                    rank={
                      round * 3 +
                      index +
                      1
                    }
                    onWear={() =>
                      markWorn.mutate(
                        {
                          outfit,
                        },
                        {
                          onSuccess: () =>
                            toast.success(
                              "Logged as worn today",
                            ),
                        },
                      )
                    }
                    onSave={() =>
                      saveOutfit.mutate(
                        {
                          outfit,
                          favorite: true,
                        },
                        {
                          onSuccess: () =>
                            toast.success(
                              "Saved to favorites",
                            ),
                        },
                      )
                    }
                    onLike={() =>
                      feedback.mutate({
                        outfit,
                        signal: "like",
                      })
                    }
                    onDislike={() =>
                      feedback.mutate(
                        {
                          outfit,
                          signal: "dislike",
                        },
                        {
                          onSuccess: () =>
                            toast.message(
                              "Noted — I'll show fewer looks like this",
                            ),
                        },
                      )
                    }
                    onAnother={() => {
                      if (hasMore) {
                        setRound(
                          (current) =>
                            current + 1,
                        );
                      } else {
                        toast.message(
                          "You've reached all available unique looks for this occasion.",
                        );
                      }
                    }}
                  />
                ))}

                {hasMore && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setRound(
                        (current) =>
                          current + 1,
                      )
                    }
                  >
                    Another
                  </Button>
                )}

                {round > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setRound(0)
                    }
                  >
                    Back to best matches
                  </Button>
                )}
              </>
            ) : (
              <EmptyState
                icon={
                  <Shirt className="size-5" />
                }
                title="No suitable outfits yet"
                body={`I couldn't build a complete ${occasion.toLowerCase()} look from the clothes currently in your wardrobe. Add more occasion-appropriate pieces and try again.`}
                action={
                  <Button asChild>
                    <Link to="/wardrobe/add">
                      Add clothes
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        </section>

        <section className="flex flex-col">
          <SectionTitle
            title="Ask your stylist"
            hint="Plain language, real wardrobe answers"
          />

          <div className="surface-card flex min-h-[420px] flex-1 flex-col rounded-3xl p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-primary-glow" />
                    Try one of these
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {PROMPTS.map((prompt) => (
                      <Badge
                        key={prompt}
                        variant="secondary"
                        className="cursor-pointer py-1.5"
                        onClick={() =>
                          void ask(prompt)
                        }
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                ),
              )}

              {thinking && (
                <p className="text-sm text-primary-glow">
                  StyleAI is thinking through your wardrobe…
                </p>
              )}

              <div ref={listEnd} />
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(question);
              }}
            >
              <Input
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
                placeholder="What should I wear today?"
              />

              <Button
                type="submit"
                size="icon"
                disabled={thinking}
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  );
}