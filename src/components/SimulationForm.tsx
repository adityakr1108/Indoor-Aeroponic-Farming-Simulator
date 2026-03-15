import { CROPS, getCropKeys, EnvironmentConfig, EconomicConfig } from "@/lib/simulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sprout, Sun, DollarSign, Zap, Lightbulb } from "lucide-react";

interface Props {
  cropKey: string;
  setCropKey: (v: string) => void;
  scenarioName: string;
  setScenarioName: (v: string) => void;
  env: EnvironmentConfig;
  setEnv: (v: EnvironmentConfig) => void;
  econ: EconomicConfig;
  setEcon: (v: EconomicConfig) => void;
  onSimulate: () => void;
  onRecommend: () => void;
  loading: boolean;
}

export default function SimulationForm({
  cropKey, setCropKey, scenarioName, setScenarioName,
  env, setEnv, econ, setEcon,
  onSimulate, onRecommend, loading,
}: Props) {
  const updateEnv = (key: keyof EnvironmentConfig, value: number) => {
    setEnv({ ...env, [key]: value });
  };

  const updateEcon = (key: keyof EconomicConfig, value: number) => {
    setEcon({ ...econ, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Crop Selection */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Sprout className="h-5 w-5 text-primary" />
            Crop & Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Crop</Label>
            <Select value={cropKey} onValueChange={setCropKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getCropKeys().map((k) => (
                  <SelectItem key={k} value={k}>
                    {CROPS[k].name} — {CROPS[k].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Scenario Name</Label>
            <Input
              placeholder="e.g. Low-cost lettuce trial"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Sun className="h-5 w-5 text-accent" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Temperature (°C)</Label>
              <Input type="number" value={env.temperature_c} onChange={(e) => updateEnv("temperature_c", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Humidity (%)</Label>
              <Input type="number" value={env.humidity_pct} onChange={(e) => updateEnv("humidity_pct", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Light hrs/day</Label>
              <Input type="number" value={env.light_hours_per_day} onChange={(e) => updateEnv("light_hours_per_day", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Light Power (kW)</Label>
              <Input type="number" step="0.1" value={env.light_power_kw} onChange={(e) => updateEnv("light_power_kw", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CO₂ (ppm)</Label>
              <Input type="number" value={env.co2_ppm} onChange={(e) => updateEnv("co2_ppm", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Plant Count</Label>
              <Input type="number" value={env.plant_count} onChange={(e) => updateEnv("plant_count", +e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economics */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <DollarSign className="h-5 w-5 text-primary" />
            Economics (INR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Electricity ₹/kWh</Label>
              <Input type="number" step="0.5" value={econ.electricity_price_per_kwh} onChange={(e) => updateEcon("electricity_price_per_kwh", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Labour ₹/day</Label>
              <Input type="number" value={econ.labour_cost_per_day} onChange={(e) => updateEcon("labour_cost_per_day", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nutrients ₹/day</Label>
              <Input type="number" value={econ.nutrient_cost_per_day} onChange={(e) => updateEcon("nutrient_cost_per_day", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CAPEX (₹)</Label>
              <Input type="number" value={econ.infrastructure_capex} onChange={(e) => updateEcon("infrastructure_capex", +e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Payback Horizon (years)</Label>
              <Input type="number" step="0.5" value={econ.payback_horizon_years} onChange={(e) => updateEcon("payback_horizon_years", +e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onSimulate} disabled={loading} className="flex-1">
          <Zap className="mr-2 h-4 w-4" />
          {loading ? "Running..." : "Run Simulation"}
        </Button>
        <Button onClick={onRecommend} disabled={loading} variant="outline" className="flex-1">
          <Lightbulb className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Recommend Best"}
        </Button>
      </div>
    </div>
  );
}
