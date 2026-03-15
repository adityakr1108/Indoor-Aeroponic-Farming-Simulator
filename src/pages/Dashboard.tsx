import { useState } from "react";
import { useSimulator } from "@/hooks/useSimulator";
import AppHeader from "@/components/AppHeader";
import SimulationForm from "@/components/SimulationForm";
import ResultCards from "@/components/ResultCards";
import GrowthChart from "@/components/GrowthChart";
import FarmerInsights from "@/components/FarmerInsights";
import RecentRuns from "@/components/RecentRuns";
import { Button } from "@/components/ui/button";
import { downloadCSV, emailReport } from "@/lib/export";
import { Sprout, Download, Mail } from "lucide-react";

export default function Dashboard() {
  const sim = useSimulator();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSimulate = async () => {
    await sim.simulate();
    setRefreshKey((k) => k + 1);
  };

  const handleRecommend = async () => {
    await sim.recommend();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Indoor Aeroponic Farming Simulator</h2>
          <p className="text-muted-foreground mt-1">
            Predict crop growth and profitability before you invest. Configure your setup, run simulations, and get smart recommendations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <SimulationForm
              cropKey={sim.cropKey}
              setCropKey={sim.setCropKey}
              scenarioName={sim.scenarioName}
              setScenarioName={sim.setScenarioName}
              env={sim.env}
              setEnv={sim.setEnv}
              econ={sim.econ}
              setEcon={sim.setEcon}
              onSimulate={handleSimulate}
              onRecommend={handleRecommend}
              loading={sim.loading}
            />
            <RecentRuns onLoadRun={sim.loadRun} refreshKey={refreshKey} />
          </div>

          <div className="space-y-6">
            {sim.result ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold sr-only">Results</h3>
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => downloadCSV(sim.result!)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => emailReport(sim.result!)}>
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Email Report
                    </Button>
                  </div>
                </div>
                <ResultCards result={sim.result} />
                <GrowthChart dailyStates={sim.result.sim.daily_states} />
                <FarmerInsights result={sim.result} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                  <Sprout className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Ready to simulate</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Configure your crop, environment, and economics on the left, then click "Run Simulation" to see growth predictions, profitability analysis, and smart insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
