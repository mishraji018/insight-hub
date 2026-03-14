import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trainModel, getTaskStatus, getModels, activateModel } from "@/api/endpoints";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

interface Model {
  id: string;
  version: string;
  algorithm: string;
  accuracy_score: number;
  trained_at: string;
  is_active: boolean;
  metrics?: { r2: number; rmse: number; mae: number };
}

const AdminTrainModelPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [training, setTraining] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [newMetrics, setNewMetrics] = useState<any>(null);

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels((data as any).results || data);
    } catch {
      setModels([
        { id: "1", version: "v2.1", algorithm: "XGBoost", accuracy_score: 0.942, trained_at: "2026-03-08 10:00 UTC", is_active: true, metrics: { r2: 0.94, rmse: 125.3, mae: 89.2 } },
        { id: "2", version: "v2.0", algorithm: "XGBoost", accuracy_score: 0.921, trained_at: "2026-03-01 09:00 UTC", is_active: false, metrics: { r2: 0.92, rmse: 142.1, mae: 98.5 } },
        { id: "3", version: "v1.0", algorithm: "LinearRegression", accuracy_score: 0.876, trained_at: "2026-02-15 14:00 UTC", is_active: false, metrics: { r2: 0.87, rmse: 187.6, mae: 134.2 } },
      ]);
    } finally {
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const handleTrain = async () => {
    setTraining(true);
    setTaskStatus("Queued");
    setNewMetrics(null);
    try {
      const data = await trainModel({ model_type: "xgboost" });
      const taskId = data.task_id;

      const poll = setInterval(async () => {
        try {
          const status = await getTaskStatus(taskId);
          setTaskStatus(status.status);
          if (status.status === "SUCCESS") {
            clearInterval(poll);
            setNewMetrics(status.metrics);
            setTraining(false);
            toast.success("Model trained successfully");
            fetchModels();
          } else if (status.status === "FAILURE") {
            clearInterval(poll);
            setTraining(false);
            toast.error("Training failed");
          }
        } catch {
          clearInterval(poll);
          setTraining(false);
        }
      }, 2000);
    } catch {
      // Simulate training
      setTaskStatus("Processing");
      setTimeout(() => {
        setTaskStatus("Complete");
        setNewMetrics({ r2: 0.951, rmse: 118.7, mae: 82.1 });
        setTraining(false);
        toast.success("Model trained (demo)");
      }, 3000);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateModel(Number(id));
      toast.success("Model activated");
      fetchModels();
    } catch {
      setModels((prev) => prev.map((m) => ({ ...m, is_active: m.id === id })));
      toast.success("Model activated (demo)");
    }
  };

  const activeModel = models.find((m) => m.is_active);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Model Training</h1>
          <p className="text-sm text-muted-foreground">Train and manage ML models</p>
        </div>

        {/* Active Model */}
        {activeModel && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Active Model</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Version</span><p className="font-mono font-semibold text-foreground">{activeModel.version}</p></div>
              <div><span className="text-muted-foreground">Algorithm</span><p className="font-semibold text-foreground">{activeModel.algorithm}</p></div>
              <div><span className="text-muted-foreground">Accuracy</span><p className="font-semibold text-foreground">{(activeModel.accuracy_score * 100).toFixed(1)}%</p></div>
              <div><span className="text-muted-foreground">Trained</span><p className="font-semibold text-foreground">{activeModel.trained_at}</p></div>
            </div>
          </div>
        )}

        {/* Train Button */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Retrain Model</p>
              <p className="text-xs text-muted-foreground">Train a new model version with latest data</p>
            </div>
            <button
              onClick={handleTrain}
              disabled={training}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {training ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {training ? taskStatus : "Retrain"}
            </button>
          </div>

          {/* New metrics comparison */}
          {newMetrics && activeModel?.metrics && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Metric</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Previous</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">New</th>
                  </tr>
                </thead>
                <tbody>
                  {(["r2", "rmse", "mae"] as const).map((m) => (
                    <tr key={m} className="border-b border-border/50">
                      <td className="px-3 py-2 font-mono text-xs text-foreground uppercase">{m}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{activeModel.metrics![m].toFixed(3)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-foreground font-semibold">{newMetrics[m].toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Model History */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Model History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Version", "Algorithm", "Accuracy", "Trained At", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{m.version}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{m.algorithm}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{(m.accuracy_score * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.trained_at}</td>
                    <td className="px-4 py-3">
                      {m.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-chart-green"><CheckCircle2 className="h-3 w-3" /> Active</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!m.is_active && (
                        <button onClick={() => handleActivate(m.id)} className="text-xs text-primary hover:underline">Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminTrainModelPage;
