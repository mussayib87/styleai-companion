import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { demoWardrobeRows } from "./demo-wardrobe";
import type { GeneratedOutfit, WardrobeItem } from "./types";
import { startOfWeek } from "./engine";

export const DEFAULT_ROUTINE: Record<string, string> = {
  Monday: "College",
  Tuesday: "College",
  Wednesday: "College",
  Thursday: "College",
  Friday: "College",
  Saturday: "Casual",
  Sunday: "Daily wear",
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  personal_photo_url: string | null;
  onboarding_completed: boolean;
  notifications_enabled: boolean;
  notification_time: string;
  city: string | null;
};

export type StylePrefs = {
  user_id: string;
  styles: string[];
  colors: string[];
  fit: string;
  occasions: string[];
  routine: Record<string, string>;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      return (data as Profile) ?? null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) throw new Error("no session");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id, ...patch })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function usePrefs() {
  return useQuery({
    queryKey: ["prefs"],
    queryFn: async (): Promise<StylePrefs | null> => {
      const { data, error } = await supabase.from("style_preferences").select("*").maybeSingle();
      if (error) throw error;
      return (data as unknown as StylePrefs) ?? null;
    },
  });
}

export function useSavePrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<StylePrefs>) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const { error } = await supabase
        .from("style_preferences")
        .upsert({ user_id, ...patch } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prefs"] }),
  });
}

export function useWardrobe() {
  return useQuery({
    queryKey: ["wardrobe"],
    queryFn: async (): Promise<WardrobeItem[]> => {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WardrobeItem[];
    },
  });
}

export function useAddItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Partial<WardrobeItem>[]) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const rows = items.map((i) => ({ ...i, user_id }));
      const { error } = await supabase.from("wardrobe_items").insert(rows as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wardrobe"] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<WardrobeItem> }) => {
      const { error } = await supabase
        .from("wardrobe_items")
        .update(patch as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wardrobe"] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wardrobe"] }),
  });
}

export function useSeedDemoWardrobe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const { error } = await supabase
        .from("wardrobe_items")
        .insert(demoWardrobeRows(user_id) as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wardrobe"] }),
  });
}

/* ---------------- outfits ---------------- */

export type SavedOutfit = {
  id: string;
  title: string;
  occasion: string;
  match_score: number;
  source: string;
  notes: string | null;
  created_at: string;
  outfit_items: { id: string; role: string; item_id: string }[];
};

export function useSavedOutfits() {
  return useQuery({
    queryKey: ["outfits"],
    queryFn: async (): Promise<SavedOutfit[]> => {
      const { data, error } = await supabase
        .from("outfits")
        .select("*, outfit_items(id, role, item_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SavedOutfit[];
    },
  });
}

export async function persistOutfit(outfit: GeneratedOutfit, notes?: string) {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) throw new Error("no session");
  const { data, error } = await supabase
    .from("outfits")
    .insert({
      user_id,
      title: outfit.title,
      occasion: outfit.occasion,
      match_score: outfit.score,
      source: "ai",
      notes: notes ?? outfit.reasons.join(" • "),
    } as never)
    .select("id")
    .single();
  if (error) throw error;
  const outfitId = (data as { id: string }).id;
  const rows = outfit.pieces.map((p) => ({
    user_id,
    outfit_id: outfitId,
    item_id: p.item.id,
    role: p.role,
  }));
  const { error: e2 } = await supabase.from("outfit_items").insert(rows as never);
  if (e2) throw e2;
  return outfitId;
}

export function useSaveOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ outfit, favorite }: { outfit: GeneratedOutfit; favorite?: boolean }) => {
      const id = await persistOutfit(outfit);
      if (favorite) {
        const { data: auth } = await supabase.auth.getUser();
        await supabase
          .from("favorites")
          .insert({ user_id: auth.user!.id, kind: "outfit", outfit_id: id } as never);
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outfits"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      outfit,
      signal,
    }: {
      outfit: GeneratedOutfit;
      signal: "like" | "dislike" | "save";
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const outfitId = signal === "save" ? await persistOutfit(outfit) : null;
      const { error } = await supabase.from("outfit_feedback").insert({
        user_id,
        outfit_id: outfitId,
        signal,
        context: {
          occasion: outfit.occasion,
          item_ids: outfit.pieces.map((p) => p.item.id),
        },
      } as never);
      if (error) throw error;
      if (signal === "save" && outfitId) {
        await supabase
          .from("favorites")
          .insert({ user_id, kind: "outfit", outfit_id: outfitId } as never);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}

export type FeedbackRow = {
  id: string;
  signal: string;
  context: { occasion?: string; item_ids?: string[] };
};

export function useFeedbackSignals() {
  return useQuery({
    queryKey: ["feedback"],
    queryFn: async (): Promise<FeedbackRow[]> => {
      const { data, error } = await supabase
        .from("outfit_feedback")
        .select("id, signal, context")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as FeedbackRow[];
    },
  });
}

/* ---------------- wear history ---------------- */

export type WearRow = {
  id: string;
  outfit_id: string | null;
  worn_on: string;
  occasion: string | null;
  item_ids: string[];
};

export function useWearHistory() {
  return useQuery({
    queryKey: ["wear-history"],
    queryFn: async (): Promise<WearRow[]> => {
      const { data, error } = await supabase
        .from("wear_history")
        .select("*")
        .order("worn_on", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as unknown as WearRow[];
    },
  });
}

export function useMarkWorn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      outfit,
      date,
    }: {
      outfit: GeneratedOutfit;
      date?: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const worn_on = date ?? new Date().toISOString().slice(0, 10);
      const outfitId = await persistOutfit(outfit);
      const itemIds = outfit.pieces.map((p) => p.item.id);
      const { error } = await supabase.from("wear_history").insert({
        user_id,
        outfit_id: outfitId,
        worn_on,
        occasion: outfit.occasion,
        item_ids: itemIds,
      } as never);
      if (error) throw error;
      for (const p of outfit.pieces) {
        await supabase
          .from("wardrobe_items")
          .update({
            times_worn: p.item.times_worn + 1,
            last_worn_at: worn_on,
          } as never)
          .eq("id", p.item.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wear-history"] });
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      qc.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}

/* ---------------- weekly plan ---------------- */

export type DailyPlanRow = {
  id: string;
  plan_date: string;
  occasion: string;
  outfit_id: string | null;
  locked: boolean;
  worn: boolean;
};

export function useWeeklyPlan() {
  const weekStart = startOfWeek().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["weekly-plan", weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_plans")
        .select("id, week_start, daily_plans:daily_plans(*)")
        .eq("week_start", weekStart)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as {
        id: string;
        week_start: string;
        daily_plans: DailyPlanRow[];
      } | null) ?? null;
    },
  });
}

export function useSaveWeeklyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      days: { date: string; occasion: string; outfit: GeneratedOutfit | null; locked?: boolean }[],
    ) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const week_start = startOfWeek().toISOString().slice(0, 10);
      const { data: plan, error } = await supabase
        .from("weekly_plans")
        .upsert({ user_id, week_start } as never, { onConflict: "user_id,week_start" })
        .select("id")
        .single();
      if (error) throw error;
      const weekly_plan_id = (plan as { id: string }).id;

      for (const day of days) {
        const outfitId = day.outfit ? await persistOutfit(day.outfit) : null;
        const { error: e } = await supabase.from("daily_plans").upsert(
          {
            user_id,
            weekly_plan_id,
            plan_date: day.date,
            occasion: day.occasion,
            outfit_id: outfitId,
            locked: day.locked ?? false,
          } as never,
          { onConflict: "user_id,plan_date" },
        );
        if (e) throw e;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly-plan"] }),
  });
}

/* ---------------- favorites ---------------- */

export type FavoriteRow = {
  id: string;
  kind: string;
  item_id: string | null;
  outfit_id: string | null;
  analysis_id: string | null;
  try_on_id: string | null;
  created_at: string;
};

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<FavoriteRow[]> => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as FavoriteRow[];
    },
  });
}

export function useToggleFavoriteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, on }: { itemId: string; on: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      if (on) {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id, kind: "item", item_id: itemId } as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("kind", "item")
          .eq("item_id", itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useToggleFavoriteOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ outfitId, on }: { outfitId: string; on: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      if (on) {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id, kind: "outfit", outfit_id: outfitId } as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("kind", "outfit")
          .eq("outfit_id", outfitId);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

/* ---------------- shopping ---------------- */

export type AnalysisRow = {
  id: string;
  product_name: string;
  product_url: string | null;
  image_url: string | null;
  category: string | null;
  color: string | null;
  compatibility: string;
  overlap: string;
  style_compatibility: string;
  new_combinations: number;
  occasions: string[];
  reasons: string[];
  concerns: string[];
  pairings: string[];
  created_at: string;
};

export function useAnalyses() {
  return useQuery({
    queryKey: ["analyses"],
    queryFn: async (): Promise<AnalysisRow[]> => {
      const { data, error } = await supabase
        .from("shopping_analyses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AnalysisRow[];
    },
  });
}

export function useSaveAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<AnalysisRow, "id" | "created_at">) => {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id;
      if (!user_id) throw new Error("no session");
      const { error } = await supabase
        .from("shopping_analyses")
        .insert({ ...row, user_id } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analyses"] }),
  });
}

/* ---------------- storage ---------------- */

export async function uploadImage(bucket: "wardrobe" | "personal", file: File | Blob) {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) throw new Error("no session");
  const ext = file instanceof File ? (file.name.split(".").pop() ?? "jpg") : "png";
  const path = `${user_id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, url: signed?.signedUrl ?? null };
}

export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}
