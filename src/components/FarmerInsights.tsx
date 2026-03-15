import { FullResult } from "@/hooks/useSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface Props {
  result: FullResult;
}

export default function FarmerInsights({ result }: Props) {
  const { economics, sim } = result;
  const insights: string[] = [];

  if (economics.net_profit > 0) {
    insights.push(
      `✅ Great news! This scenario is profitable with a net profit of ₹${economics.net_profit.toLocaleString("en-IN")} per cycle.`
    );
  } else {
    insights.push(
      `⚠️ This scenario is currently not profitable. You're losing ₹${Math.abs(economics.net_profit).toLocaleString("en-IN")} per cycle. Try reducing costs or increasing yield.`
    );
  }

  if (sim.success_probability < 0.5) {
    insights.push(
      "🌡️ High environmental stress detected. Your temperature, light, or CO₂ settings are far from optimal for this crop. Adjust them closer to the crop's ideal range."
    );
  } else if (sim.success_probability > 0.85) {
    insights.push(
      "🌿 Environmental conditions are excellent! The crop should grow well with minimal stress."
    );
  }

  if (economics.roi > 50) {
    insights.push(
      `📈 ROI of ${economics.roi.toFixed(1)}% is strong — this looks like an attractive setup for commercial farming.`
    );
  } else if (economics.roi > 0 && economics.roi < 15) {
    insights.push(
      "📊 ROI is positive but modest. Consider scaling up plant count or optimizing costs to improve returns."
    );
  }

  if (economics.payback_period_years > 5) {
    insights.push(
      `⏱️ Payback period of ${economics.payback_period_years.toFixed(1)} years is long. Consider lowering CAPEX or improving yield to recover investment faster.`
    );
  } else if (economics.payback_period_years > 0 && economics.payback_period_years <= 2) {
    insights.push(
      `🚀 Excellent! You'd recover your investment in just ${economics.payback_period_years.toFixed(1)} years.`
    );
  }

  if (economics.electricity_cost > economics.total_cost * 0.4) {
    insights.push(
      "💡 Electricity is your biggest cost driver (>40% of total). Consider reducing light power or hours, or look for cheaper electricity rates."
    );
  }

  if (economics.labour_cost > economics.total_cost * 0.4) {
    insights.push(
      "👷 Labour costs are very high. Automation or batch processing could help reduce this."
    );
  }

  return (
    <Card className="shadow-card border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <MessageCircle className="h-5 w-5 text-primary" />
          Farmer Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <p key={i} className="text-sm leading-relaxed">
              {insight}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
