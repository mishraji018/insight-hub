import { Sparkles } from "lucide-react";

interface MLInsightCardProps {
  insight: string;
  confidence: number;
  generated_at: string;
}

export function MLInsightCard({ insight, confidence, generated_at }: MLInsightCardProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">AI Insight</span>
        <span className="ml-auto text-xs text-muted-foreground">{Math.round(confidence * 100)}% confidence</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{insight}</p>
      <p className="text-xs text-muted-foreground mt-3">{generated_at}</p>
    </div>
  );
}
