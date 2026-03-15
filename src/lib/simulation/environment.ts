export interface EnvironmentConfig {
  temperature_c: number;
  humidity_pct: number;
  light_hours_per_day: number;
  light_power_kw: number;
  co2_ppm: number;
  plant_count: number;
}

export interface EconomicConfig {
  electricity_price_per_kwh: number;  // INR
  labour_cost_per_day: number;        // INR
  nutrient_cost_per_day: number;      // INR
  infrastructure_capex: number;       // INR total
  payback_horizon_years: number;
}

export const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  temperature_c: 22,
  humidity_pct: 70,
  light_hours_per_day: 16,
  light_power_kw: 2.0,
  co2_ppm: 1000,
  plant_count: 100,
};

export const DEFAULT_ECONOMICS: EconomicConfig = {
  electricity_price_per_kwh: 8,
  labour_cost_per_day: 500,
  nutrient_cost_per_day: 200,
  infrastructure_capex: 500000,
  payback_horizon_years: 5,
};
