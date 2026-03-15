import { CropConfig } from "./crops";
import { EnvironmentConfig } from "./environment";

export interface DailyState {
  day: number;
  biomass_per_plant_g: number;
  biomass_total_kg: number;
  stress_factor: number;
  growth_stage: string;
}

export interface SimulationResult {
  daily_states: DailyState[];
  yield_kg: number;
  success_probability: number;
  cycle_days: number;
}

function computeStress(env: EnvironmentConfig, crop: CropConfig): number {
  // Temperature stress
  let tempStress = 0;
  if (env.temperature_c < crop.optimal_temp_min) {
    tempStress = Math.min(1, (crop.optimal_temp_min - env.temperature_c) / 10);
  } else if (env.temperature_c > crop.optimal_temp_max) {
    tempStress = Math.min(1, (env.temperature_c - crop.optimal_temp_max) / 10);
  }

  // Light stress
  const lightDiff = Math.abs(env.light_hours_per_day - crop.optimal_light_hours);
  const lightStress = Math.min(1, lightDiff / 8);

  // CO2 stress
  const co2Diff = Math.abs(env.co2_ppm - crop.optimal_co2_ppm);
  const co2Stress = Math.min(1, co2Diff / 500);

  // Weighted combination
  return Math.min(1, tempStress * 0.4 + lightStress * 0.35 + co2Stress * 0.25);
}

function getGrowthStage(day: number, totalDays: number): string {
  const fraction = day / totalDays;
  if (fraction < 0.2) return "Germination";
  if (fraction < 0.5) return "Vegetative";
  if (fraction < 0.8) return "Maturation";
  return "Harvest-ready";
}

export function runSimulation(
  crop: CropConfig,
  env: EnvironmentConfig
): SimulationResult {
  const { cycle_days, max_biomass_g, growth_rate } = crop;
  const dailyStress = computeStress(env, crop);
  const effectiveGrowthRate = growth_rate * (1 - dailyStress);

  const daily_states: DailyState[] = [];
  let biomass = max_biomass_g * 0.01; // start at 1% of max

  let totalStress = 0;

  for (let day = 1; day <= cycle_days; day++) {
    // Logistic growth: dB/dt = r * B * (1 - B/K)
    const growth = effectiveGrowthRate * biomass * (1 - biomass / max_biomass_g);
    biomass = Math.min(max_biomass_g, biomass + growth);

    const biomass_total_kg = (biomass * env.plant_count) / 1000;
    totalStress += dailyStress;

    daily_states.push({
      day,
      biomass_per_plant_g: Math.round(biomass * 100) / 100,
      biomass_total_kg: Math.round(biomass_total_kg * 1000) / 1000,
      stress_factor: Math.round(dailyStress * 1000) / 1000,
      growth_stage: getGrowthStage(day, cycle_days),
    });
  }

  const yield_kg = (biomass * env.plant_count) / 1000;
  const avgStress = totalStress / cycle_days;
  const success_probability = Math.max(0, Math.min(1, 1 - avgStress));

  return {
    daily_states,
    yield_kg: Math.round(yield_kg * 1000) / 1000,
    success_probability: Math.round(success_probability * 1000) / 1000,
    cycle_days,
  };
}
