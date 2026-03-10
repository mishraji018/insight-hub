import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { KPICard } from "@/components/KPICard";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { ForecastChart } from "@/components/ForecastChart";
import { RegionalHeatmap } from "@/components/RegionalHeatmap";
import { AnomalyAlert } from "@/components/AnomalyAlert";
import { MLInsightCard } from "@/components/MLInsightCard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getAnalyticsSummary, downloadPDFReport, downloadExcelReport } from "@/api/endpoints";
import { Calendar, Download, Loader2 } from "lucide-react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/analytics/";

const DashboardPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const { lastMessage } = useWebSocket(WS_URL);

  useEffect(() => {
    getAnalyticsSummary()
      .then((r) => setSummary(r.data))
      .catch(() => {
        // Use mock data for demo
        setSummary({
          kpis: [
            { title: "Total Revenue", value: "$1.2M", unit: "", change: 12.5, trend: "up" },
            { title: "Daily Avg Sales", value: "4,280", unit: "units", change: -3.2, trend: "down" },
            { title: "Active Regions", value: "12", unit: "", change: 0, trend: "neutral" },
            { title: "Forecast Accuracy", value: "94.2", unit: "%", change: 2.1, trend: "up" },
          ],
          salesTrend: Array.from({ length: 30 }, (_, i) => ({
            date: `Mar ${i + 1}`,
            actual_sales: 3000 + Math.random() * 2000,
            predicted_sales: 3200 + Math.random() * 1800,
          })),
          forecast: Array.from({ length: 7 }, (_, i) => ({
            date: `Apr ${i + 1}`,
            predicted_sales: 4000 + Math.random() * 1000,
            confidence: 300 + Math.random() * 200,
          })),
          regions: [
            { region: "North", sales: 12000, predicted: 13500 },
            { region: "South", sales: 9800, predicted: 9200 },
            { region: "East", sales: 11200, predicted: 12100 },
            { region: "West", sales: 8500, predicted: 9800 },
          ],
          alerts: [
            { region: "South", date: "Mar 28", description: "Sales dropped 15% below forecast", severity: "high" as const },
            { region: "East", date: "Mar 27", description: "Unusual spike in marketing spend", severity: "medium" as const },
          ],
          insight: {
            insight: "North region shows consistent upward momentum. Consider increasing marketing budget allocation by 20% to capitalize on growth trend.",
            confidence: 0.87,
            generated_at: "2026-03-09 14:30 UTC",
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Update KPIs from WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === "kpi_update") {
          setSummary((prev: any) => prev ? { ...prev, kpis: data.kpis } : prev);
        }
      } catch { }
    }
  }, [lastMessage]);

  const handleExport = async (type: "pdf" | "excel") => {
    if (!dateFrom || !dateTo) return;
    setExporting(type);
    try {
      const fn = type === "pdf" ? downloadPDFReport : downloadExcelReport;
      const { data } = await fn(dateFrom, dateTo);
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { }
    setExporting(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Sales analytics and forecasting overview</p>
          </div>

          {/* Report Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground" />
              <span className="text-xs text-muted-foreground">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground" />
            </div>
            <button
              onClick={() => handleExport("pdf")}
              disabled={!dateFrom || !dateTo || exporting !== null}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {exporting === "pdf" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              PDF
            </button>
            <button
              onClick={() => handleExport("excel")}
              disabled={!dateFrom || !dateTo || exporting !== null}
              className="flex items-center gap-1.5 rounded-md bg-chart-green px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {exporting === "excel" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              Excel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(summary?.kpis || Array(4).fill(null)).map((kpi: any, i: number) => (
            <KPICard key={i} title={kpi?.title || ""} value={kpi?.value || ""} unit={kpi?.unit} change={kpi?.change} trend={kpi?.trend} isLoading={loading} />
          ))}
        </div>

        {/* Alerts */}
        {summary?.alerts && <AnomalyAlert alerts={summary.alerts} />}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summary?.salesTrend && <SalesTrendChart data={summary.salesTrend} />}
          {summary?.forecast && <ForecastChart data={summary.forecast} />}
        </div>

        {/* Regional + Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summary?.regions && <RegionalHeatmap data={summary.regions} />}
          {summary?.insight && <MLInsightCard {...summary.insight} />}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
