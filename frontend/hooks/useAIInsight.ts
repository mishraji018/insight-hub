import { useState, useCallback } from "react";

// ============================================================================
// Demo insights — rotated when no API key is set
// ============================================================================
const DEMO_INSIGHTS = [
  {
    insight:
      "North region shows consistent upward momentum (+12.5%). Recommend allocating an additional 20% of marketing budget to capitalize on this growth trajectory before Q2 peak season.",
    confidence: 0.91,
    tag: "Growth Opportunity",
    tagColor: "emerald",
  },
  {
    insight:
      "Sales velocity in the South region dropped 15% below ML forecast over the last 7 days. Root cause analysis points to reduced marketing spend last week. A $4K injection is projected to recover trajectory within 5 days.",
    confidence: 0.84,
    tag: "Anomaly Detected",
    tagColor: "red",
  },
  {
    insight:
      "Forecast accuracy is currently at 94.2%, up 2.1% from last month. The model is most precise for PROD-1001 through PROD-1050. Consider using this segment as a benchmark for cross-regional demand planning.",
    confidence: 0.87,
    tag: "Model Performance",
    tagColor: "blue",
  },
  {
    insight:
      "Product cluster analysis reveals that PROD-12xx and PROD-23xx are frequently purchased together. Bundling these as a combo SKU is projected to increase average order value by 18% based on historical co-purchase patterns.",
    confidence: 0.79,
    tag: "Cross-sell Signal",
    tagColor: "purple",
  },
  {
    insight:
      "East region is tracking 8% above predicted sales this week. Historical data shows this pattern precedes a mid-month correction. Proactively adjusting stock levels by 10% is recommended before day 15.",
    confidence: 0.82,
    tag: "Inventory Alert",
    tagColor: "orange",
  },
];

export interface AIInsight {
  insight: string;
  confidence: number;
  tag: string;
  tagColor: string;
  generated_at: string;
}

// ============================================================================
// Hook
// ============================================================================
export function useAIInsight() {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AIInsight[]>([]);
  const [demoIndex, setDemoIndex] = useState(0);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const generate = useCallback(
    async (context?: string) => {
      setIsLoading(true);

      try {
        // ── Gemini API mode ─────────────────────────────────────────────────
        if (apiKey) {
          const prompt = context
            ? `You are an enterprise analytics AI. Analyze the following dashboard context and generate one concise, actionable business insight in 2-3 sentences. Focus on trends, anomalies, or opportunities. Context: ${context}`
            : "You are an enterprise analytics AI. Generate one concise, actionable business insight about sales performance in 2-3 sentences.";

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            const newInsight: AIInsight = {
              insight: text,
              confidence: 0.88 + Math.random() * 0.1,
              tag: "AI Generated",
              tagColor: "blue",
              generated_at: new Date().toLocaleString(),
            };
            setInsight(newInsight);
            setHistory((h) => [newInsight, ...h].slice(0, 5));
            return;
          }
        }

        // ── Demo / fallback mode ─────────────────────────────────────────────
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
        const next = DEMO_INSIGHTS[demoIndex % DEMO_INSIGHTS.length];
        const newInsight: AIInsight = {
          ...next,
          generated_at: new Date().toLocaleString(),
        };
        setInsight(newInsight);
        setHistory((h) => [newInsight, ...h].slice(0, 5));
        setDemoIndex((i) => i + 1);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, demoIndex]
  );

  return { insight, isLoading, generate, history };
}
