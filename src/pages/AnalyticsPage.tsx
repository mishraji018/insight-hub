import { useCallback, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { uploadCSV, getSalesData } from "@/api/endpoints";
import { Upload, FileSpreadsheet, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const AnalyticsPage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loadingTable, setLoadingTable] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadCSV(file, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      toast.success(`Uploaded: ${data.inserted} inserted, ${data.skipped} skipped`);
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
      const { data } = await getSalesData({ page: p, page_size: 10, ordering });
      setTableData(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
      setPage(p);
    } catch {
      // Use mock data
      setTableData(
        Array.from({ length: 10 }, (_, i) => ({
          date: `2026-03-${String(i + 1).padStart(2, "0")}`,
          product_id: `PROD-${1000 + i}`,
          region: ["North", "South", "East", "West"][i % 4],
          sales_amount: (2000 + Math.random() * 5000).toFixed(2),
          marketing_spend: (500 + Math.random() * 1500).toFixed(2),
        }))
      );
      setTotalPages(5);
      setPage(p);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Upload data and explore sales records</p>
        </div>

        {/* Upload Zone */}
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

        {/* Data Table */}
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
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
