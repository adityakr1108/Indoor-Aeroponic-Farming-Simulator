import { CropConfig } from "./crops";
import { EnvironmentConfig, EconomicConfig } from "./environment";
import { runSimulation, SimulationResult } from "./simulation";
import { evaluateEconomics, EconomicResult } from "./economics";

interface OptimizationCandidate {
  env: EnvironmentConfig;
  simResult: SimulationResult;
  econResult: EconomicResult;
  score: number;
}

export interface RecommendationResult {
  bestEnv: EnvironmentConfig;
  simResult: SimulationResult;
  econResult: EconomicResult;
  score: number;
}

export function findBestSetup(
  crop: CropConfig,
  econ: EconomicConfig
): RecommendationResult {
  const candidates: OptimizationCandidate[] = [];

  // Search grid around optimal values
  const tempRange = [
    crop.optimal_temp_min,
    (crop.optimal_temp_min + crop.optimal_temp_max) / 2,
    crop.optimal_temp_max,
  ];
  const lightRange = [
    Math.max(8, crop.optimal_light_hours - 2),
    crop.optimal_light_hours,
    Math.min(20, crop.optimal_light_hours + 2),
  ];
  const co2Range = [
    Math.max(400, crop.optimal_co2_ppm - 200),
    crop.optimal_co2_ppm,
    Math.min(1500, crop.optimal_co2_ppm + 200),
  ];
  const plantCounts = [50, 100, 200, 300, 500];
  const lightPowers = [1, 2, 3];

  for (const temp of tempRange) {
    for (const light of lightRange) {
      for (const co2 of co2Range) {
        for (const plants of plantCounts) {
          for (const power of lightPowers) {
            const env: EnvironmentConfig = {
              temperature_c: temp,
              humidity_pct: 70,
              light_hours_per_day: light,
              light_power_kw: power,
              co2_ppm: co2,
              plant_count: plants,
            };

            const simResult = runSimulation(crop, env);
            const econResult = evaluateEconomics(
              simResult.yield_kg,
              simResult.cycle_days,
              crop,
              env,
              econ
            );

            // Score: prioritize ROI and success probability
            const score =
              econResult.roi * 1 + simResult.success_probability * 50;

            candidates.push({ env, simResult, econResult, score });
          }
        }
      }
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    bestEnv: best.env,
    simResult: best.simResult,
    econResult: best.econResult,
    score: best.score,
  };
}
