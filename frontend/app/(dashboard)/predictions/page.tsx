"use client";

import { AppLayout } from "@/components/AppLayout";
import { ForecastChart } from "@/components/ForecastChart";
import { useForecast } from "@/hooks/useForecast";
import { useAIInsight } from "@/hooks/useAIInsight";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, RefreshCw, History, ChevronRight,
  Loader2, Zap, Brain,
} from "lucide-react";

const TAG_STYLES: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  red: "bg-red-500/10 text-red-400 border-red-500/25",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/25",
  default: "bg-primary/10 text-primary border-primary/25",
};

const PredictionsPage = () => {
  // ── EXISTING logic — UNTOUCHED ────────────────────────────────────────────
  const { data, isLoading } = useForecast();

  const forecastData = data?.forecast || Array.from({ length: 7 }, (_, i) => ({
    date: `Apr ${i + 1}`,
    predicted_sales: 4000 + Math.random() * 1000,
    confidence: 300 + Math.random() * 200,
  }));

  // ── NEW — AI Insight hook ─────────────────────────────────────────────────
  const { insight, isLoading: insightLoading, generate, history } = useAIInsight();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Predictions</h1>
          <p className="text-sm text-muted-foreground">ML-powered sales forecasting &amp; AI insights</p>
        </div>

        {/* ── EXISTING ForecastChart — UNTOUCHED ── */}
        {isLoading ? (
          <div className="glass-card p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : (
          <ForecastChart data={forecastData} />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            NEW — AI Insight Generator
            ════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Generator panel */}
          <div className="lg:col-span-2 glass-card p-6 space-y-5 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground">AI Insight Generator</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Powered by Insight Hub AI
                  </p>
                </div>
              </div>

              <button
                onClick={() => generate()}
                disabled={insightLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95"
              >
                {insightLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : insight ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {insightLoading ? "Analyzing..." : insight ? "New Insight" : "Generate Insight"}
              </button>
            </div>

            {/* Empty state */}
            {!insight && !insightLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
                  <Zap className="h-8 w-8 text-primary/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">No insight generated yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                  Click "Generate Insight" to get an AI-powered analysis of your current sales data.
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {insightLoading && (
              <div className="space-y-3 relative z-10 animate-pulse">
                <Skeleton className="h-4 w-3/4 bg-primary/10" />
                <Skeleton className="h-4 w-full bg-primary/10" />
                <Skeleton className="h-4 w-5/6 bg-primary/10" />
                <Skeleton className="h-4 w-2/3 bg-primary/10" />
              </div>
            )}

            {/* Insight result */}
            {insight && !insightLoading && (
              <div className="relative z-10 animate-fade-slide-up space-y-4">
                {/* Tag */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      TAG_STYLES[insight.tagColor] ?? TAG_STYLES.default
                    }`}
                  >
                    {insight.tag}
                  </span>
                </div>

                {/* Confidence bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Confidence
                    </span>
                    <span className="text-[10px] font-black text-primary">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round(insight.confidence * 100)}%`,
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--chart-green)))",
                      }}
                    />
                  </div>
                </div>

                {/* Insight text in a styled box */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-foreground leading-relaxed">{insight.insight}</p>
                </div>

                <p className="text-[10px] text-muted-foreground/60">
                  Generated at {insight.generated_at}
                </p>
              </div>
            )}
          </div>

          {/* Right — Insight history */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                History
              </h3>
              <span className="ml-auto text-[10px] font-bold text-muted-foreground/50">
                Last {history.length}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                  No history yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all cursor-default group animate-fade-slide-up`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                          TAG_STYLES[h.tagColor] ?? TAG_STYLES.default
                        } shrink-0`}
                      >
                        {h.tag}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0 group-hover:text-muted-foreground/50 transition-colors mt-0.5" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                      {h.insight}
                    </p>
                    <p className="text-[9px] text-muted-foreground/40 mt-2">{h.generated_at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PredictionsPage;
