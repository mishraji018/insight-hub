import { AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  region: string;
  date: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface AnomalyAlertProps {
  alerts: Alert[];
}

export function AnomalyAlert({ alerts: initialAlerts }: AnomalyAlertProps) {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismiss = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const bgClass =
          alert.severity === "high"
            ? "bg-severity-high/10 border-severity-high/30"
            : alert.severity === "medium"
            ? "bg-severity-medium/10 border-severity-medium/30"
            : "bg-severity-low/10 border-severity-low/30";

        const iconColor =
          alert.severity === "high"
            ? "text-severity-high"
            : alert.severity === "medium"
            ? "text-severity-medium"
            : "text-severity-low";

        const Icon = alert.severity === "low" ? Info : AlertTriangle;

        return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bgClass}`}>
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {alert.region} — {alert.date}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
            </div>
            <button onClick={() => dismiss(i)} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
