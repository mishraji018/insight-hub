import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Trophy } from "lucide-react";

interface RegionData {
  region: string;
  sales: number;
  predicted: number;
}

interface RegionalHeatmapProps {
  data: RegionData[];
}

export function RegionalHeatmap({ data }: RegionalHeatmapProps) {
  // Compute top region — purely additive
  const top = data.reduce((max, d) => (d.sales > max.sales ? d : max), data[0]);
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const topPct = totalSales > 0 ? ((top.sales / totalSales) * 100).toFixed(0) : "0";

  return (
    <div className="glass-card p-5">
      {/* ── Header row with top-region badge ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground">Regional Performance</h3>
        {top && (
          <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Trophy className="h-3 w-3" />
            {top.region} leads · {topPct}% share
          </span>
        )}
      </div>

      {/* ── Existing chart — UNCHANGED ── */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="region" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
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
            <Bar dataKey="sales" name="Actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="predicted" name="Predicted" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill="hsl(var(--foreground))"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
