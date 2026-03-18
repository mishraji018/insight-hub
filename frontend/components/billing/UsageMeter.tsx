"use client";

import { cn } from '@/lib/utils';
import { AlertCircle, Zap } from 'lucide-react';

interface UsageMeterProps {
  used: number;
  limit: number;
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= 80 && percentage < 90;
  const isDanger = percentage >= 90;

  return (
    <div className="bg-surface border border-surface2 rounded-xl p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className={cn(
              "w-4 h-4",
              isDanger ? "text-danger" : isWarning ? "text-warning" : "text-accent"
            )} />
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Usage Stats</h3>
          </div>
          <span className="text-xs font-bold text-muted">{used.toLocaleString()} / {limit.toLocaleString()}</span>
        </div>
        
        <div className="h-3 w-full bg-surface2 rounded-full overflow-hidden mb-2">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out rounded-full",
              isDanger ? "bg-danger" : isWarning ? "bg-warning" : "bg-accent shadow-glow-sm"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest">
          <span>API Requests</span>
          <span>{percentage.toFixed(1)}% used</span>
        </div>
      </div>

      {(isWarning || isDanger) && (
        <div className={cn(
          "mt-4 p-3 rounded-lg flex items-start gap-3 border animate-in slide-in-from-bottom-2",
          isDanger ? "bg-danger/10 border-danger/20 text-danger" : "bg-warning/10 border-warning/20 text-warning"
        )}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            {isDanger 
              ? "You've almost reached your monthly limit. Upgrade your plan to avoid service interruption." 
              : "Usage is high. Consider upgrading soon to ensure continuous service."}
          </p>
        </div>
      )}
    </div>
  );
}
