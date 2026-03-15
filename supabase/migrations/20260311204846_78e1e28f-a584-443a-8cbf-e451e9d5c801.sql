-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create simulation_runs table
CREATE TABLE public.simulation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL DEFAULT 'Untitled',
  crop_key TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  temperature_c DOUBLE PRECISION NOT NULL,
  humidity_pct DOUBLE PRECISION NOT NULL,
  light_hours_per_day DOUBLE PRECISION NOT NULL,
  light_power_kw DOUBLE PRECISION NOT NULL,
  co2_ppm DOUBLE PRECISION NOT NULL,
  plant_count INTEGER NOT NULL,
  electricity_price_per_kwh DOUBLE PRECISION NOT NULL,
  labour_cost_per_day DOUBLE PRECISION NOT NULL,
  nutrient_cost_per_day DOUBLE PRECISION NOT NULL,
  infrastructure_capex DOUBLE PRECISION NOT NULL,
  payback_horizon_years DOUBLE PRECISION NOT NULL,
  cycle_days INTEGER NOT NULL,
  yield_kg DOUBLE PRECISION NOT NULL,
  success_probability DOUBLE PRECISION NOT NULL,
  electricity_cost DOUBLE PRECISION NOT NULL,
  labour_cost DOUBLE PRECISION NOT NULL,
  nutrient_cost DOUBLE PRECISION NOT NULL,
  infrastructure_cost_per_cycle DOUBLE PRECISION NOT NULL,
  total_cost DOUBLE PRECISION NOT NULL,
  revenue DOUBLE PRECISION NOT NULL,
  net_profit DOUBLE PRECISION NOT NULL,
  roi DOUBLE PRECISION NOT NULL,
  payback_period_years DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own runs" ON public.simulation_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own runs" ON public.simulation_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own runs" ON public.simulation_runs FOR DELETE USING (auth.uid() = user_id);

-- Create daily_states table
CREATE TABLE public.daily_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  biomass_per_plant_g DOUBLE PRECISION NOT NULL,
  biomass_total_kg DOUBLE PRECISION NOT NULL,
  stress_factor DOUBLE PRECISION NOT NULL,
  growth_stage TEXT NOT NULL
);

ALTER TABLE public.daily_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view daily states of their runs" ON public.daily_states FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.simulation_runs WHERE id = run_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert daily states for their runs" ON public.daily_states FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.simulation_runs WHERE id = run_id AND user_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_simulation_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX idx_simulation_runs_created_at ON public.simulation_runs(created_at DESC);
CREATE INDEX idx_daily_states_run_id ON public.daily_states(run_id);