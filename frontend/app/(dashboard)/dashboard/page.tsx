"use client";

import { useState, useEffect } from 'react';
import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardAreaChart 
} from '@/components/charts/DashboardCharts';
import { LiveActiveUsers } from '@/components/dashboard/LiveActiveUsers';
import { Users, Activity, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight, TrendingUp, FileText, Download, Sparkles, Calendar } from 'lucide-react';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';
import { generateDashboardPdf } from '@/lib/report';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('week');

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard/stats?range=${range}`);
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
  }, [range]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Metric', 'Value', 'Trend'];
    const rows = [
      ['Total Logins', data.totalLogins, data.loginsTrend],
      ['Days Active', data.daysActive, data.daysActiveTrend],
      ['Features Used', data.featuresUsed, data.featuresUsedTrend],
      ['Avg Session',  `${data.avgSessionMinutes}m`, data.avgSessionTrend]
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insight-hub-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const kpis = [
    { 
      label: 'Total Logins',  
      value: data?.totalLogins?.toLocaleString() ?? '0', 
      rawValue: data?.totalLogins ?? 0,
      icon: Users,            
      trend: data?.loginsTrend ?? '0%', 
      isUp: data?.loginsUp ?? true,  
      href: '/analytics',
      delay: 100  
    },
    { 
      label: 'Days Active',   
      value: data?.daysActive?.toString() ?? '0',     
      rawValue: data?.daysActive ?? 0,
      icon: Activity,         
      trend: data?.daysActiveTrend ?? '0%',  
      isUp: data?.daysActiveUp ?? true,  
      href: '/analytics',
      delay: 175  
    },
    { 
      label: 'Features Used', 
      value: data?.featuresUsed?.toString() ?? '0',      
      rawValue: data?.featuresUsed ?? 0,
      icon: MousePointerClick, 
      trend: data?.featuresUsedTrend ?? '0%', 
      isUp: data?.featuresUsedUp ?? false, 
      href: '/developer',
      delay: 250  
    },
    { 
      label: 'Avg. Session',  
      value: `${data?.avgSessionMinutes ?? 0}m`,     
      rawValue: data?.avgSessionMinutes ?? 0,
      icon: Clock,            
      trend: data?.avgSessionTrend ?? '0%',  
      isUp: data?.avgSessionUp ?? true,  
      href: '/analytics',
      delay: 325  
    },
  ];

  return (
    <div id="dashboard-report" className="space-y-5">

      {/* ── Section Header / Welcome ── */}
      <div
        className="animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ animationDelay: '50ms' }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <h6 className="text-accent opacity-100 italic">Insight Hub Dashboard</h6>
          </div>
          <h1 className="text-3xl font-black text-text tracking-tight">
            Welcome back, {data?.firstName || 'User'} 👋
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-[11px] font-bold text-muted flex items-center gap-1.5 opacity-80">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Last login: <span className="text-text">{data?.lastLogin || 'Recent'}</span>
            </p>
            <p className="text-[11px] font-bold text-muted flex items-center gap-1.5 opacity-80">
              <Activity className="w-3.5 h-3.5 text-accent" />
              Daily Active Status: <span className="text-success">Perfect</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface2/40 text-text rounded-xl text-xs font-bold transition-all border border-surface2 ripple-btn shadow-sm"
          >
            <Download className="w-4 h-4 text-accent" />
            Export CSV
          </button>
          <button 
            onClick={async () => {
              const t = toast.loading('Generating report...');
              try {
                await generateDashboardPdf('dashboard-report', 'insight_hub_dashboard');
                toast.success('Report downloaded!', { id: t });
              } catch (err) {
                toast.error('Failed to generate report', { id: t });
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shadow-glow-sm ripple-btn"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Date Range Filter Bar ── */}
      <div className="flex justify-between items-center gap-4 bg-surface/50 p-1.5 rounded-2xl border border-surface2/50 backdrop-blur-md">
        <div className="flex bg-surface2/30 rounded-xl p-1">
          {['today', 'week', 'month', 'custom'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                range === r 
                  ? "bg-accent text-white shadow-card" 
                  : "text-muted hover:text-text hover:bg-surface2/50"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/5 rounded-xl border border-accent/10">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-black text-accent uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={`sk-${i}`} />)
          : kpis.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={i}
                  href={stat.href}
                  className={cn(
                    "card p-6 group cursor-pointer relative overflow-hidden",
                    "animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  )}
                  style={{ animationDelay: `${stat.delay}ms` }}
                >
                  {/* Decorative Gradient Glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="p-3 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-glow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={cn(
                        "flex items-center text-[10px] font-black px-3 py-1.5 rounded-full gap-1 uppercase tracking-widest shadow-sm",
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

                  <div className="relative z-10 space-y-1">
                    <h3 className="text-4xl font-black text-text tracking-tight">
                      {typeof stat.rawValue === 'number' ? (
                        <AnimatedNumber value={stat.rawValue} />
                      ) : (
                        stat.value
                      )}
                    </h3>
                    <p className="text-[11px] font-black text-muted uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      {stat.label}
                    </p>
                  </div>
                  
                  {/* Subtle bar indicator */}
                  <div className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-500 w-0 group-hover:w-full opacity-30" />
                </Link>
              );
            })}
      </div>

      {/* ── Charts & Live Session Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Live Stat - Activity Pulling */}
        <div className="lg:col-span-12 xl:col-span-3">
          <LiveActiveUsers />
        </div>

        {/* Line Chart */}
        <div
          className="lg:col-span-12 xl:col-span-9 card p-5 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '400ms' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text">Login Activity</h3>
            <p className="text-[10px] text-muted mt-0.5">Weekly login trends across all users</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[250px]" />
            : <DashboardLineChart data={data?.loginTrend} animationDelay={0} />}
        </div>

        {/* Bar Chart */}
        <div
          className="lg:col-span-12 xl:col-span-5 card p-5 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '500ms' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text">Top Features</h3>
            <p className="text-[10px] text-muted mt-0.5">Most utilized features this week</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[250px]" />
            : <DashboardBarChart data={data?.featureTrend} animationDelay={80} />}
        </div>

        {/* Area Chart */}
        <div
          className="lg:col-span-12 xl:col-span-7 card p-5 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
          style={{ animationDelay: '600ms' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text">Active Sessions</h3>
            <p className="text-[10px] text-muted mt-0.5">Concurrent active sessions over time</p>
          </div>
          {isLoading
            ? <ChartSkeleton className="h-[250px]" />
            : <DashboardAreaChart data={data?.sessionTrend} animationDelay={160} />}
        </div>

      </div>
    </div>
  );
}
