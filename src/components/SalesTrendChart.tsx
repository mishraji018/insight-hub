import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DataPoint {
  date: string;
  actual_sales: number;
  predicted_sales: number;
}

interface SalesTrendChartProps {
  data: DataPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  // Compute peak and trend — purely additive, doesn't change chart rendering
  const peak = data.reduce((max, d) => (d.actual_sales > max.actual_sales ? d : max), data[0]);
  const first = data[0]?.actual_sales ?? 0;
  const last = data[data.length - 1]?.actual_sales ?? 0;
  const trendPct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : "0.0";
  const trendUp = last >= first;

  return (
    <div className="glass-card p-5">
      {/* ── Header row with badges ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground">Sales Trend</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            Peak: <span className="text-foreground">{peak?.date}</span>
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
              trendUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendUp ? "+" : ""}
            {trendPct}%
          </span>
        </div>
      </div>

      {/* ── Existing chart — UNCHANGED ── */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="actual_sales" name="Actual" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="predicted_sales" name="Predicted" stroke="hsl(var(--chart-orange))" strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
