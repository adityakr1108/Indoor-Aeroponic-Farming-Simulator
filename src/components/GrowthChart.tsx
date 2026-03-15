import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DailyState } from "@/lib/simulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  dailyStates: DailyState[];
}

export default function GrowthChart({ dailyStates }: Props) {
  const data = {
    labels: dailyStates.map((s) => `Day ${s.day}`),
    datasets: [
      {
        label: "Biomass Total (kg)",
        data: dailyStates.map((s) => s.biomass_total_kg),
        borderColor: "hsl(152, 55%, 32%)",
        backgroundColor: "hsla(152, 55%, 32%, 0.1)",
        fill: true,
        yAxisID: "y",
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "Stress Factor",
        data: dailyStates.map((s) => s.stress_factor),
        borderColor: "hsl(0, 72%, 51%)",
        backgroundColor: "hsla(0, 72%, 51%, 0.1)",
        fill: false,
        yAxisID: "y1",
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { family: "'Space Grotesk', sans-serif" },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 10,
          font: { family: "'Inter', sans-serif", size: 11 },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Biomass (kg)",
          font: { family: "'Space Grotesk', sans-serif" },
        },
        grid: { color: "hsla(140, 15%, 88%, 0.5)" },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Stress (0-1)",
          font: { family: "'Space Grotesk', sans-serif" },
        },
        min: 0,
        max: 1,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <BarChart3 className="h-5 w-5 text-primary" />
          Growth & Stress Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
