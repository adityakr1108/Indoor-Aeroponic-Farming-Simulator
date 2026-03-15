import { CropConfig } from "./crops";
import { EnvironmentConfig, EconomicConfig } from "./environment";

export interface EconomicResult {
  electricity_cost: number;
  labour_cost: number;
  nutrient_cost: number;
  infrastructure_cost_per_cycle: number;
  total_cost: number;
  revenue: number;
  net_profit: number;
  roi: number;
  payback_period_years: number;
  cost_per_kg: number;
  profit_per_kg: number;
}

export function evaluateEconomics(
  yield_kg: number,
  cycle_days: number,
  crop: CropConfig,
  env: EnvironmentConfig,
  econ: EconomicConfig
): EconomicResult {
  // Electricity: light_power_kw * hours/day * days * price
  const electricity_cost =
    env.light_power_kw * env.light_hours_per_day * cycle_days * econ.electricity_price_per_kwh;

  const labour_cost = econ.labour_cost_per_day * cycle_days;
  const nutrient_cost = econ.nutrient_cost_per_day * cycle_days;

  // Annualize CAPEX over payback horizon, then prorate to this cycle
  const cycles_per_year = 365 / cycle_days;
  const annual_capex = econ.infrastructure_capex / econ.payback_horizon_years;
  const infrastructure_cost_per_cycle = annual_capex / cycles_per_year;

  const total_cost = electricity_cost + labour_cost + nutrient_cost + infrastructure_cost_per_cycle;
  const revenue = yield_kg * crop.price_per_kg;
  const net_profit = revenue - total_cost;
  const roi = total_cost > 0 ? (net_profit / total_cost) * 100 : 0;

  const annual_profit = net_profit * cycles_per_year;
  const payback_period_years =
    annual_profit > 0 ? econ.infrastructure_capex / annual_profit : -1;

  const cost_per_kg = yield_kg > 0 ? total_cost / yield_kg : 0;
  const profit_per_kg = yield_kg > 0 ? net_profit / yield_kg : 0;

  return {
    electricity_cost: Math.round(electricity_cost),
    labour_cost: Math.round(labour_cost),
    nutrient_cost: Math.round(nutrient_cost),
    infrastructure_cost_per_cycle: Math.round(infrastructure_cost_per_cycle),
    total_cost: Math.round(total_cost),
    revenue: Math.round(revenue),
    net_profit: Math.round(net_profit),
    roi: Math.round(roi * 100) / 100,
    payback_period_years: payback_period_years > 0 ? Math.round(payback_period_years * 100) / 100 : -1,
    cost_per_kg: Math.round(cost_per_kg * 100) / 100,
    profit_per_kg: Math.round(profit_per_kg * 100) / 100,
  };
}
