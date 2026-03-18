"use client";

import { useState, useEffect } from "react";
import { Users, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function LiveActiveUsers() {
  const [count, setCount] = useState<number | null>(null);

  const fetchActiveUsers = async () => {
    try {
      const res = await fetch("/api/stats/active-users");
      if (res.ok) {
        const data = await res.json();
        setCount(data.activeCount);
      }
    } catch (err) {
      console.error("Failed to fetch active users:", err);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="premium-card p-5 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-success/10 text-success rounded-xl group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-muted uppercase tracking-widest">Active Now</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-[10px] font-bold text-success uppercase tracking-tighter">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-4xl font-black text-text tracking-tight h-10">
          {count === null ? (
            <div className="w-12 h-8 bg-surface2 animate-pulse rounded-lg" />
          ) : (
            <AnimatedNumber value={count} />
          )}
        </h3>
        <p className="text-[10px] font-medium text-muted mt-1 leading-tight max-w-[140px]">
          Users currently interacting with the platform
        </p>
      </div>
    </div>
  );
}
