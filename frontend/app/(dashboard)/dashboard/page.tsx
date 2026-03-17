"use client";

import { useState, useEffect } from 'react';
import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardAreaChart 
} from '@/components/charts/DashboardCharts';
import { Users, Activity, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const kpis = [
    { 
      label: 'Total Logins',  
      value: data?.totalLogins?.toLocaleString() ?? '0', 
      icon: Users,            
      trend: data?.loginsTrend ?? '0%', 
      isUp: data?.loginsUp ?? true,  
      delay: 100  
    },
    { 
      label: 'Days Active',   
      value: data?.daysActive?.toString() ?? '0',     
      icon: Activity,         
      trend: data?.daysActiveTrend ?? '0%',  
      isUp: data?.daysActiveUp ?? true,  
      delay: 175  
    },
    { 
      label: 'Features Used', 
      value: data?.featuresUsed?.toString() ?? '0',      
      icon: MousePointerClick, 
      trend: data?.featuresUsedTrend ?? '0%', 
      isUp: data?.featuresUsedUp ?? false, 
      delay: 250  
    },
    { 
      label: 'Avg. Session',  
      value: `${data?.avgSessionMinutes ?? 0}m`,     
      icon: Clock,            
      trend: data?.avgSessionTrend ?? '0%',  
      isUp: data?.avgSessionUp ?? true,  
      delay: 325  
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Section Header ── */}
      <div
        className="animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">Overview</span>
        </div>
        <h2 className="text-2xl font-bold text-text">Platform Analytics</h2>
        <p className="text-sm text-muted mt-0.5">Monitor user activity and platform performance in real time.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={`sk-${i}`} />)
          : kpis.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    // Base
                    "relative overflow-hidden bg-surface border border-surface2 rounded-xl p-5 shadow-card group cursor-default",
                    // Hover effects
                    "transition-all duration-300 ease-spring",
                    "hover:scale-[1.03] hover:-translate-y-1 hover:shadow-glow hover:border-accent/30",
                    // Entry animation
                    "animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                  )}
                  style={{ animationDelay: `${stat.delay}ms` }}
                >
                  {/* Subtle radial glow on hover (pseudo via gradient overlay) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-300 rounded-xl pointer-events-none" />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-surface2 rounded-lg text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={cn(
                        "flex items-center text-xs font-semibold px-2 py-1 rounded-full gap-0.5",
                        stat.isUp
                          ? "text-success bg-success/10"
                          : "text-danger bg-danger/10"
                      )}
                    >
                      {stat.isUp
                        ? <ArrowUpRight className="w-3.5 h-3.5" />
                        : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {stat.trend}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-3xl font-extrabold text-text mb-0.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-accent2 transition-all duration-300">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-muted">{stat.label}</p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line Chart */}
        <div
          className="bg-surface border border-surface2 rounded-xl p-6 transition-all duration-300 hover:shadow-glow/40 hover:border-accent/20 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '400ms' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold text-text">Login Activity</h3>
            <p className="text-xs text-muted mt-0.5">Weekly login trends across all users</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[300px]" />
            : <DashboardLineChart data={data?.loginTrend} animationDelay={0} />}
        </div>

        {/* Bar Chart */}
        <div
          className="bg-surface border border-surface2 rounded-xl p-6 transition-all duration-300 hover:shadow-glow/40 hover:border-accent/20 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '500ms' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold text-text">Top Features</h3>
            <p className="text-xs text-muted mt-0.5">Most utilized features this week</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[300px]" />
            : <DashboardBarChart data={data?.featureTrend} animationDelay={80} />}
        </div>

        {/* Area Chart — full width */}
        <div
          className="bg-surface border border-surface2 rounded-xl p-6 lg:col-span-2 transition-all duration-300 hover:shadow-glow/40 hover:border-accent/20 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '600ms' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold text-text">Active Sessions</h3>
            <p className="text-xs text-muted mt-0.5">Concurrent active sessions over time</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[300px]" />
            : <DashboardAreaChart data={data?.sessionTrend} animationDelay={160} />}
        </div>

      </div>
    </div>
  );
}
