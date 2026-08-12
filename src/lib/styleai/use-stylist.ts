import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_ROUTINE,
  useFeedbackSignals,
  usePrefs,
  useProfile,
  useWardrobe,
  useWearHistory,
} from "./data";
import { WeatherService } from "./weather";
import type { StylistContext } from "./engine";

export function useWeather(city?: string | null) {
  return useQuery({
    queryKey: ["weather", city ?? "default"],
    queryFn: () => WeatherService.current(city ?? "Your city"),
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Assembles the stylist agent's read context: profile, wardrobe, preferences,
 * wear history, feedback signals and weather.
 */
export function useStylistContext() {
  const wardrobe = useWardrobe();
  const prefs = usePrefs();
  const profile = useProfile();
  const history = useWearHistory();
  const feedback = useFeedbackSignals();
  const weather = useWeather(profile.data?.city ?? null);

  const routine = useMemo(
    () =>
      prefs.data?.routine && Object.keys(prefs.data.routine).length
        ? prefs.data.routine
        : DEFAULT_ROUTINE,
    [prefs.data],
  );

  const base: Omit<StylistContext, "occasion"> = useMemo(() => {
    const recent = (history.data ?? []).flatMap((h) => h.item_ids);
    const liked = (feedback.data ?? [])
      .filter((f) => f.signal === "like" || f.signal === "save")
      .flatMap((f) => f.context?.item_ids ?? []);
    const disliked = (feedback.data ?? [])
      .filter((f) => f.signal === "dislike")
      .flatMap((f) => f.context?.item_ids ?? []);
    return {
      recentItemIds: recent,
      likedItemIds: liked,
      dislikedItemIds: disliked.filter((id) => !liked.includes(id)),
      preferredStyles: prefs.data?.styles ?? [],
      preferredColors: prefs.data?.colors ?? [],
      preferredFit: prefs.data?.fit ?? "regular",
      weather: weather.data
        ? { condition: weather.data.condition, tempC: weather.data.tempC }
        : undefined,
    };
  }, [history.data, feedback.data, prefs.data, weather.data]);

  const todayOccasion = useMemo(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return routine[day] ?? "Casual";
  }, [routine]);

  return {
    items: wardrobe.data ?? [],
    wardrobeLoading: wardrobe.isLoading,
    profile: profile.data ?? null,
    prefs: prefs.data ?? null,
    routine,
    base,
    weather: weather.data ?? null,
    history: history.data ?? [],
    todayOccasion,
    loading: wardrobe.isLoading || prefs.isLoading || profile.isLoading,
  };
}

export function profileSummary(
  prefs: { styles: string[]; colors: string[]; fit: string; occasions: string[] } | null,
  name?: string | null,
): string {
  if (!prefs) return `Name: ${name ?? "user"}; no preferences set yet`;
  return `Name: ${name ?? "user"}; styles: ${prefs.styles.join(", ") || "n/a"}; colors: ${
    prefs.colors.join(", ") || "n/a"
  }; fit: ${prefs.fit}; occasions: ${prefs.occasions.join(", ") || "n/a"}`;
}
