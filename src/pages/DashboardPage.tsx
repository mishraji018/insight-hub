import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/authStore";
import { KPICard } from "@/components/KPICard";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { ForecastChart } from "@/components/ForecastChart";
import { RegionalHeatmap } from "@/components/RegionalHeatmap";
import { AnomalyAlert } from "@/components/AnomalyAlert";
import { MLInsightCard } from "@/components/MLInsightCard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getAnalyticsSummary, downloadPDFReport, downloadExcelReport, authAPI } from "@/api/endpoints";
import { Calendar, Download, Loader2, Activity, BarChart3, AlertTriangle, Map, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingModal } from "@/components/OnboardingModal";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/dashboard/";

const EmptySkeleton = ({ title, type, className = "h-[300px]" }: { title?: string, type: string, className?: string }) => (
  <Card className={`glass-card border-none shadow-xl flex flex-col items-center justify-center overflow-hidden relative ${className}`}>
    {title && (
      <div className="absolute top-4 left-4 z-20">
        <h3 className="text-sm font-bold text-foreground/70">{title}</h3>
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    <div className="flex flex-col items-center justify-center text-muted-foreground/30 z-10 space-y-4">
      {type === 'chart' ? <BarChart3 className="h-12 w-12" /> : type === 'alerts' ? <AlertTriangle className="h-12 w-12" /> : type === 'heatmap' ? <Map className="h-12 w-12" /> : type === 'kpi' ? <Database className="h-6 w-6" /> : <Database className="h-12 w-12" />}
      <span className={`font-black tracking-widest uppercase opacity-50 ${type === 'kpi' ? 'text-xs' : 'text-xl'}`}>Empty Data</span>
    </div>
  </Card>
);

const DashboardPage = () => {
  const user = useAuthStore(s => s.user);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { lastMessage } = useWebSocket(WS_URL);

  useEffect(() => {
    getAnalyticsSummary()
      .then((r) => setSummary(r))
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

    authAPI.getUserStats().then(s => setUserStats(s)).catch(() => {});
    authAPI.trackActivity("Dashboard");

    if (user && user.onboarding_complete === false) {
      setShowOnboarding(true);
    }
  }, [user]);

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
      const data = await fn(dateFrom.toISOString(), dateTo.toISOString());
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
      <div className="space-y-4 flex-1 flex flex-col pb-2 h-[calc(100vh-130px)] lg:h-[calc(100vh-146px)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || user?.email || 'User'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email} • Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'recently'}
            </p>
          </div>

          {/* Report Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 relative z-50">
              <div className="relative">
                <button 
                  onClick={() => { setShowFromCalendar(!showFromCalendar); setShowToCalendar(false); }}
                  className="flex items-center gap-2 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs text-foreground hover:bg-black/5 dark:bg-white/5 transition-colors"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Start Date"}
                </button>
                {showFromCalendar && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-xl shadow-2xl scale-in-center">
                    <DayPicker 
                      mode="single" 
                      selected={dateFrom} 
                      onSelect={(d) => { setDateFrom(d); setShowFromCalendar(false); }} 
                      className="text-foreground"
                    />
                  </div>
                )}
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase">to</span>
              <div className="relative">
                <button 
                  onClick={() => { setShowToCalendar(!showToCalendar); setShowFromCalendar(false); }}
                  className="flex items-center gap-2 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs text-foreground hover:bg-black/5 dark:bg-white/5 transition-colors"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "End Date"}
                </button>
                {showToCalendar && (
                  <div className="absolute top-full right-0 mt-2 p-3 bg-card border border-border rounded-xl shadow-2xl scale-in-center">
                    <DayPicker 
                      mode="single" 
                      selected={dateTo} 
                      onSelect={(d) => { setDateTo(d); setShowToCalendar(false); }} 
                      className="text-foreground"
                    />
                  </div>
                )}
              </div>
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

        {/* Dynamic Bento Box Layout */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 w-full">
          
          {/* Top Row: KPIs + Alerts */}
          <div className="flex-[0.8] flex gap-3 w-full min-h-0">
            {/* KPIs */}
            <div className="flex-[2] transition-all duration-500 flex gap-3">
              {(summary?.kpis?.length ? summary.kpis : [
                { title: "Total Revenue" },
                { title: "Daily Avg Sales" },
                { title: "Active Regions" },
                { title: "Forecast Accuracy" }
              ]).map((kpi: any, i: number) => (
                <div key={i} className="flex-1 hover:flex-[1.5] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
                  {kpi.value ? (
                    <KPICard title={kpi.title} value={kpi.value} unit={kpi.unit} change={kpi.change} trend={kpi.trend} isLoading={loading} />
                  ) : (
                    <EmptySkeleton title={kpi.title} type="kpi" className="h-full" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Alerts */}
            <div className="flex-1 hover:flex-[1.5] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              {summary?.alerts ? <AnomalyAlert alerts={summary.alerts} /> : <EmptySkeleton title="Anomaly Alerts" type="alerts" className="h-full" />}
            </div>
          </div>

          {/* Middle Row: Charts */}
          <div className="flex-[1.2] flex gap-3 w-full min-h-0">
            <div className="flex-1 hover:flex-[1.5] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              {summary?.salesTrend ? <SalesTrendChart data={summary.salesTrend} /> : <EmptySkeleton title="Sales Trend" type="chart" className="h-full" />}
            </div>
            <div className="flex-1 hover:flex-[1.5] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              {summary?.forecast ? <ForecastChart data={summary.forecast} /> : <EmptySkeleton title="Forecast Prediction" type="chart" className="h-full" />}
            </div>
          </div>

          {/* Bottom Row: Regional + Insight */}
          <div className="flex-1 flex gap-3 w-full min-h-0">
            <div className="flex-[2] hover:flex-[3] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              {summary?.regions ? <RegionalHeatmap data={summary.regions} /> : <EmptySkeleton title="Regional Heatmap" type="heatmap" className="h-full" />}
            </div>
            
            <div className="flex-[1.5] hover:flex-[2.5] transition-all duration-500 min-w-0 h-full rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              {summary?.insight ? <MLInsightCard {...summary.insight} /> : <EmptySkeleton title="AI Business Insight" type="insight" className="h-full" />}
            </div>
          </div>
        </div>
      </div>
      
      <OnboardingModal 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </AppLayout>
  );
};

export default DashboardPage;
