import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { crop_key, simulation_history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context from simulation history
    let historyContext = "";
    if (simulation_history && simulation_history.length > 0) {
      const summary = simulation_history.map((r: any) => 
        `- ${r.scenario_name} (${r.crop_name}): Yield=${r.yield_kg?.toFixed(2)}kg, ROI=${(r.roi * 100).toFixed(1)}%, Profit=₹${r.net_profit?.toFixed(0)}, Temp=${r.temperature_c}°C, Light=${r.light_hours_per_day}h, CO2=${r.co2_ppm}ppm, Plants=${r.plant_count}`
      ).join("\n");
      historyContext = `\n\nUser's simulation history (most recent first):\n${summary}`;
    }

    const systemPrompt = `You are an expert indoor aeroponic farming advisor. You analyze simulation data and provide actionable recommendations to farmers.

Crop database (Indian market):
- Lettuce: 35-day cycle, optimal 18-24°C, 16h light, 1000ppm CO2, ₹120/kg
- Strawberry: 90-day cycle, optimal 15-22°C, 14h light, 900ppm CO2, ₹400/kg  
- Saffron: 120-day cycle, optimal 15-20°C, 12h light, 800ppm CO2, ₹300,000/kg
- Basil: 28-day cycle, optimal 20-28°C, 14h light, 1000ppm CO2, ₹250/kg
- Spinach: 40-day cycle, optimal 15-22°C, 14h light, 900ppm CO2, ₹80/kg

Provide recommendations in clear markdown with:
1. **Optimal Environment Settings** — specific temperature, light hours, CO2, and plant count
2. **Predicted Performance** — expected yield, revenue, and profitability  
3. **Cost Optimization** — ways to reduce electricity, labour, and nutrient costs
4. **Risk Assessment** — potential issues and mitigation strategies
5. **Comparison with Past Runs** — how this recommendation improves on their history (if available)

Use Indian Rupees (₹) for all monetary values. Be specific with numbers.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Give me an optimal crop recommendation for growing "${crop_key}" in an indoor aeroponic system. Include specific environment settings, expected economics, and actionable tips.${historyContext}`,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content || "Unable to generate recommendation.";

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-crop-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
