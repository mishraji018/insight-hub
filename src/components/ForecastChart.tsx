import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ForecastPoint {
  date: string;
  predicted_sales: number;
  confidence: number;
}

interface ForecastChartProps {
  data: ForecastPoint[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    upper: d.predicted_sales + d.confidence,
    lower: d.predicted_sales - d.confidence,
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">7-Day Forecast</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--chart-orange))" fillOpacity={0.15} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
            <Area type="monotone" dataKey="predicted_sales" stroke="hsl(var(--chart-orange))" fill="hsl(var(--chart-orange))" fillOpacity={0.3} strokeWidth={2} name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
