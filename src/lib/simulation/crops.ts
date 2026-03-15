export interface CropConfig {
  key: string;
  name: string;
  cycle_days: number;
  max_biomass_g: number;       // max biomass per plant in grams
  growth_rate: number;          // logistic growth rate constant
  optimal_temp_min: number;
  optimal_temp_max: number;
  optimal_light_hours: number;
  optimal_co2_ppm: number;
  price_per_kg: number;         // INR per kg
  description: string;
}

export const CROPS: Record<string, CropConfig> = {
  lettuce: {
    key: "lettuce",
    name: "Lettuce",
    cycle_days: 35,
    max_biomass_g: 300,
    growth_rate: 0.18,
    optimal_temp_min: 18,
    optimal_temp_max: 24,
    optimal_light_hours: 16,
    optimal_co2_ppm: 1000,
    price_per_kg: 120,
    description: "Fast-growing leafy green, ideal for aeroponics beginners.",
  },
  strawberry: {
    key: "strawberry",
    name: "Strawberry",
    cycle_days: 90,
    max_biomass_g: 250,
    growth_rate: 0.08,
    optimal_temp_min: 15,
    optimal_temp_max: 22,
    optimal_light_hours: 14,
    optimal_co2_ppm: 900,
    price_per_kg: 400,
    description: "High-value fruit crop with moderate growth cycle.",
  },
  saffron: {
    key: "saffron",
    name: "Saffron",
    cycle_days: 120,
    max_biomass_g: 5,
    growth_rate: 0.06,
    optimal_temp_min: 15,
    optimal_temp_max: 20,
    optimal_light_hours: 12,
    optimal_co2_ppm: 800,
    price_per_kg: 300000,
    description: "Ultra-premium spice. Low yield but extremely high value.",
  },
  basil: {
    key: "basil",
    name: "Basil",
    cycle_days: 28,
    max_biomass_g: 150,
    growth_rate: 0.22,
    optimal_temp_min: 20,
    optimal_temp_max: 28,
    optimal_light_hours: 14,
    optimal_co2_ppm: 1000,
    price_per_kg: 250,
    description: "Fast herb with high market demand.",
  },
  spinach: {
    key: "spinach",
    name: "Spinach",
    cycle_days: 40,
    max_biomass_g: 200,
    growth_rate: 0.15,
    optimal_temp_min: 15,
    optimal_temp_max: 22,
    optimal_light_hours: 14,
    optimal_co2_ppm: 900,
    price_per_kg: 80,
    description: "Nutritious leafy green, steady demand.",
  },
};

export const getCropKeys = () => Object.keys(CROPS);
export const getCrop = (key: string): CropConfig | undefined => CROPS[key];
