import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}

export function KPICard({ title, value, unit, change, trend = "neutral", isLoading }: KPICardProps) {
  const [pulse, setPulse] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setPulse(true);
      setPrevValue(value);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  if (isLoading) {
    return (
      <div className="glass-card p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : ArrowRight;
  const trendColor = trend === "up" ? "text-trend-up" : trend === "down" ? "text-trend-down" : "text-trend-neutral";

  return (
    <div className="glass-card p-5 transition-shadow hover:shadow-card-hover">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className={`mt-2 flex items-baseline gap-1 ${pulse ? "animate-pulse-value" : ""}`}>
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{change > 0 ? "+" : ""}{change}%</span>
        </div>
      )}
    </div>
  );
}
