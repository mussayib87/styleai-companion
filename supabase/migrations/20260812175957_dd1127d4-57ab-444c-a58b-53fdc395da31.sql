CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  personal_photo_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_time TIME NOT NULL DEFAULT '07:30',
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.style_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  styles TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  fit TEXT NOT NULL DEFAULT 'regular',
  occasions TEXT[] NOT NULL DEFAULT '{}',
  routine JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_preferences TO authenticated;
GRANT ALL ON public.style_preferences TO service_role;
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.style_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.style_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'neutral',
  secondary_color TEXT,
  pattern TEXT NOT NULL DEFAULT 'solid',
  style TEXT NOT NULL DEFAULT 'casual',
  fit TEXT NOT NULL DEFAULT 'regular',
  sleeve TEXT,
  season TEXT NOT NULL DEFAULT 'all',
  formality INT NOT NULL DEFAULT 2,
  image_url TEXT,
  in_laundry BOOLEAN NOT NULL DEFAULT false,
  times_worn INT NOT NULL DEFAULT 0,
  last_worn_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wardrobe_user ON public.wardrobe_items(user_id, category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wardrobe_items TO authenticated;
GRANT ALL ON public.wardrobe_items TO service_role;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items" ON public.wardrobe_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_items_updated BEFORE UPDATE ON public.wardrobe_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  occasion TEXT NOT NULL DEFAULT 'casual',
  match_score INT NOT NULL DEFAULT 80,
  source TEXT NOT NULL DEFAULT 'ai',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfits TO authenticated;
GRANT ALL ON public.outfits TO service_role;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own outfits" ON public.outfits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_outfits_updated BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.wardrobe_items ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'top',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_outfit_items_outfit ON public.outfit_items(outfit_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_items TO authenticated;
GRANT ALL ON public.outfit_items TO service_role;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own outfit items" ON public.outfit_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.outfit_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  signal TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_feedback TO authenticated;
GRANT ALL ON public.outfit_feedback TO service_role;
ALTER TABLE public.outfit_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.outfit_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE SET NULL,
  worn_on DATE NOT NULL DEFAULT current_date,
  occasion TEXT,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wear_history TO authenticated;
GRANT ALL ON public.wear_history TO service_role;
ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.wear_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_plans TO authenticated;
GRANT ALL ON public.weekly_plans TO service_role;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly plans" ON public.weekly_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_weekly_updated BEFORE UPDATE ON public.weekly_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  weekly_plan_id UUID NOT NULL REFERENCES public.weekly_plans ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  occasion TEXT NOT NULL DEFAULT 'casual',
  outfit_id UUID REFERENCES public.outfits ON DELETE SET NULL,
  locked BOOLEAN NOT NULL DEFAULT false,
  worn BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_plans TO authenticated;
GRANT ALL ON public.daily_plans TO service_role;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily plans" ON public.daily_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_daily_updated BEFORE UPDATE ON public.daily_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shopping_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_url TEXT,
  image_url TEXT,
  category TEXT,
  color TEXT,
  compatibility TEXT NOT NULL DEFAULT 'medium',
  overlap TEXT NOT NULL DEFAULT 'low',
  style_compatibility TEXT NOT NULL DEFAULT 'medium',
  new_combinations INT NOT NULL DEFAULT 0,
  occasions TEXT[] NOT NULL DEFAULT '{}',
  reasons TEXT[] NOT NULL DEFAULT '{}',
  concerns TEXT[] NOT NULL DEFAULT '{}',
  pairings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_analyses TO authenticated;
GRANT ALL ON public.shopping_analyses TO service_role;
ALTER TABLE public.shopping_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analyses" ON public.shopping_analyses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.try_on_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE SET NULL,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.try_on_requests TO authenticated;
GRANT ALL ON public.try_on_requests TO service_role;
ALTER TABLE public.try_on_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tryon" ON public.try_on_requests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL,
  item_id UUID REFERENCES public.wardrobe_items ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.shopping_analyses ON DELETE CASCADE,
  try_on_id UUID REFERENCES public.try_on_requests ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'daily_outfit',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wardrobe own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "wardrobe own write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "wardrobe own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "personal own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'personal' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "personal own write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'personal' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "personal own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'personal' AND auth.uid()::text = (storage.foldername(name))[1]);
