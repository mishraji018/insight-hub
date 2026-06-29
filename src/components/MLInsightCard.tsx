import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";

interface MLInsightCardProps {
  insight: string;
  confidence: number;
  generated_at: string;
}

const TAG_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function MLInsightCard({ insight, confidence, generated_at }: MLInsightCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = Math.round(confidence * 100);
  const confidenceColor =
    confidencePct >= 88 ? "text-emerald-400" : confidencePct >= 75 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="glass-card p-5 relative overflow-hidden animate-fade-slide-up group">
      {/* Shimmer background strip */}
      <div className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none rounded-lg" />

      {/* Accent border highlight */}
      <div className="absolute inset-0 rounded-lg border border-primary/10 group-hover:border-primary/25 transition-colors pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-primary">
            AI Insight
          </span>

          {/* Confidence badge */}
          <span className={`ml-auto text-[10px] font-black uppercase tracking-tight ${confidenceColor}`}>
            {confidencePct}% confidence
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all"
            title="Copy insight"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Confidence bar */}
        <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${confidencePct}%`,
              background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--chart-green)))`,
            }}
          />
        </div>

        {/* Insight text */}
        <p className="text-sm text-foreground leading-relaxed">{insight}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-muted-foreground/50" />
            <p className="text-[10px] text-muted-foreground">
              Generated: {generated_at}
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 border border-primary/15 rounded px-1.5 py-0.5">
            Insight Hub AI
          </span>
        </div>
      </div>
    </div>
  );
}
