/**
 * Weather service abstraction.
 *
 * The UI and outfit engine only depend on this shape, so a real provider can
 * be plugged in later without touching product code.
 */
export type WeatherCondition = "hot" | "mild" | "cold" | "rain";

export type WeatherSnapshot = {
  condition: WeatherCondition;
  tempC: number;
  label: string;
  city: string;
  source: "demo" | "api";
};

const LABELS: Record<WeatherCondition, string> = {
  hot: "Warm & clear",
  mild: "Mild",
  cold: "Cold",
  rain: "Rain likely",
};

export const WeatherService = {
  /** Deterministic demo weather until a provider key is configured. */
  async current(city = "Your city"): Promise<WeatherSnapshot> {
    const day = new Date().getDate();
    const conditions: WeatherCondition[] = ["mild", "hot", "rain", "cold"];
    const condition = conditions[day % conditions.length]!;
    const temps: Record<WeatherCondition, number> = { hot: 33, mild: 24, cold: 12, rain: 21 };
    return {
      condition,
      tempC: temps[condition],
      label: LABELS[condition],
      city,
      source: "demo",
    };
  },
};
