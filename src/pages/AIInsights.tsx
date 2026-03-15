import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { getCropKeys, CROPS } from "@/lib/simulation/crops";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIInsights() {
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState("lettuce");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("simulation_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setRunCount(count || 0));
  }, [user]);

  const getAIRecommendation = async () => {
    if (!user) return;
    setLoading(true);
    setAiResponse("");

    try {
      // Fetch user's simulation history for context
      const { data: runs } = await supabase
        .from("simulation_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const { data, error } = await supabase.functions.invoke("ai-crop-advisor", {
        body: {
          crop_key: selectedCrop,
          simulation_history: runs || [],
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add credits in your workspace settings.");
        } else {
          throw error;
        }
        return;
      }

      setAiResponse(data.recommendation);
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error("Failed to get AI recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Crop Advisor
        </h2>
        <p className="text-muted-foreground mt-1">
          Get AI-powered recommendations based on your simulation history and crop parameters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-display">Get Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Select Crop</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCropKeys().map((k) => (
                      <SelectItem key={k} value={k}>{CROPS[k].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50">
                <p className="font-medium mb-1">What AI will analyze:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Optimal environment settings for {CROPS[selectedCrop].name}</li>
                  <li>Your past {runCount} simulation results</li>
                  <li>Cost reduction strategies</li>
                  <li>Yield improvement opportunities</li>
                </ul>
              </div>

              <Button className="w-full" onClick={getAIRecommendation} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {loading ? "Analyzing..." : "Get AI Recommendation"}
              </Button>
            </CardContent>
          </Card>

          {runCount === 0 && (
            <Card className="border-warning/30">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Run some simulations first for more personalized AI recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {aiResponse ? (
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  AI Recommendation for {CROPS[selectedCrop].name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select a crop and click "Get AI Recommendation" to receive optimal settings, cost strategies, and yield predictions based on your data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
