"use client";

import { useCallback, useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { uploadCSV, getSalesData } from "@/api/endpoints";
import {
  Upload, FileSpreadsheet, Loader2, ChevronUp, ChevronDown,
  BarChart2, TrendingUp, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ============================================================================
// NEW — quick date-range filter type
// ============================================================================
type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  "all": "All Time",
};

const AnalyticsPage = () => {
  // ── EXISTING state — UNTOUCHED ────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loadingTable, setLoadingTable] = useState(false);

  // ── NEW state — below-table features only ────────────────────────────────
  const [activeRange, setActiveRange] = useState<Range>("30d");

  // ── EXISTING handlers — UNTOUCHED ─────────────────────────────────────────
  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadCSV(file);
      toast.success(`Uploaded: ${(data as any).inserted} inserted, ${(data as any).skipped} skipped`);
      fetchData(1);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchData = useCallback(async (p: number) => {
    setLoadingTable(true);
    try {
      const ordering = sortDir === "desc" ? `-${sortField}` : sortField;
      const data = await getSalesData({ page: p, page_size: 10, ordering });
      setTableData((data as any).results || []);
      setTotalPages(Math.ceil(((data as any).count || 0) / 10));
      setPage(p);
    } catch (err) {
      console.error("Failed to fetch analytics data", err);
      setTableData([]);
      setTotalPages(0);
      setPage(1);
    } finally {
      setLoadingTable(false);
    }
  }, [sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const columns = ["date", "product_id", "region", "sales_amount", "marketing_spend"];

  // ── NEW — Derived summary metrics from tableData ──────────────────────────
  const summaryMetrics = useMemo(() => {
    if (tableData.length === 0) return null;
    const totalSales = tableData.reduce((s, r) => s + parseFloat(r.sales_amount || 0), 0);
    const avgSales = totalSales / tableData.length;
    const regionMap: Record<string, number> = {};
    tableData.forEach((r) => {
      regionMap[r.region] = (regionMap[r.region] || 0) + parseFloat(r.sales_amount || 0);
    });
    const topRegion = Object.entries(regionMap).sort((a, b) => b[1] - a[1])[0];
    return { totalSales, avgSales, regionMap, topRegion };
  }, [tableData]);

  // Chart data derived from regionMap
  const chartData = useMemo(() => {
    if (!summaryMetrics?.regionMap) return [];
    return Object.entries(summaryMetrics.regionMap).map(([region, sales]) => ({
      region,
      sales: parseFloat(sales.toFixed(2)),
    }));
  }, [summaryMetrics]);

  const CHART_COLORS = [
    "hsl(var(--chart-blue))",
    "hsl(var(--chart-orange))",
    "hsl(var(--chart-green))",
    "hsl(var(--chart-purple))",
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Upload data and explore sales records</p>
        </div>

        {/* ── EXISTING Upload Zone — UNTOUCHED ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className={`glass-card p-8 border-2 border-dashed transition-colors text-center ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="w-48 mx-auto h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Drop a CSV file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
              <label className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors">
                <FileSpreadsheet className="h-4 w-4" />
                Choose file
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </label>
            </>
          )}
        </div>

        {/* ── EXISTING Data Table — UNTOUCHED ── */}
        {tableData.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          {col.replace("_", " ")}
                          <SortIcon field={col} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-3 text-foreground font-mono text-xs">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => fetchData(page - 1)} disabled={page <= 1 || loadingTable} className="px-3 py-1 text-xs rounded-md border border-input text-foreground hover:bg-muted disabled:opacity-50 transition-colors">Prev</button>
                <button onClick={() => fetchData(page + 1)} disabled={page >= totalPages || loadingTable} className="px-3 py-1 text-xs rounded-md border border-input text-foreground hover:bg-muted disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          </div>
        )}

        {tableData.length === 0 && !uploading && (
          <button onClick={() => fetchData(1)} className="text-sm text-primary hover:underline">
            Load recent data preview →
          </button>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            NEW — Summary metrics + chart (only shown when data is loaded)
            ════════════════════════════════════════════════════════════════════ */}
        {summaryMetrics && (
          <div className="space-y-5 animate-fade-slide-up">
            {/* Quick filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                Range:
              </span>
              {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activeRange === r
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 flex items-center gap-4 glow-on-hover" style={{ "--glow-color": "hsl(var(--chart-blue) / 0.3)" } as React.CSSProperties}>
                <div className="p-2.5 rounded-xl bg-blue-500/10 shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-black text-foreground">
                    ${summaryMetrics.totalSales.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4 glow-on-hover" style={{ "--glow-color": "hsl(var(--chart-orange) / 0.3)" } as React.CSSProperties}>
                <div className="p-2.5 rounded-xl bg-orange-500/10 shrink-0">
                  <BarChart2 className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Avg / Entry</p>
                  <p className="text-xl font-black text-foreground">
                    ${summaryMetrics.avgSales.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4 glow-on-hover" style={{ "--glow-color": "hsl(var(--chart-green) / 0.3)" } as React.CSSProperties}>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Top Region</p>
                  <p className="text-xl font-black text-foreground">
                    {summaryMetrics.topRegion?.[0] ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Regional sales bar chart */}
            {chartData.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Sales by Region</h3>
                  <span className="ml-auto text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {RANGE_LABELS[activeRange]}
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Sales"]}
                      />
                      <Bar dataKey="sales" name="Sales" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
