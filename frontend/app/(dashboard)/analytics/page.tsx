"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { Filter, Download, Calendar, TrendingUp, Laptop, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats';
import { LocationTable } from '@/components/analytics/LocationTable';
import { Skeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)'];

const rangeOptions = [
  { label: 'Today', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/advanced?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, [range]);

  const handleExportCSV = () => {
    if (!data) return;
    
    // Simple CSV export for login activity
    const headers = ['Date', 'Logins'];
    const rows = data.charts.loginActivity.map((d: any) => [d.date, d.value]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${range}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-surface2 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-muted uppercase mb-1">{label}</p>
          <p className="text-sm font-bold text-text">{payload[0].value.toLocaleString()} {payload[0].name === 'value' ? 'Logins' : payload[0].name}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-surface2 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            Advanced Analytics
            <TrendingUp className="w-5 h-5 text-accent" />
          </h1>
          <p className="text-sm text-muted">Deep dive into platform performance and user engagement</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <div className="flex bg-surface2 rounded-xl p-1">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  range === opt.value 
                    ? "bg-surface text-accent shadow-sm" 
                    : "text-muted hover:text-text"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold transition-all shadow-glow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <AnalyticsStats 
        stats={data?.stats || { totalUsers: 0, activeToday: 0, newThisWeek: 0, churnRate: '0%' }} 
        isLoading={isLoading} 
      />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Login Activity — Large Area */}
        <div className="lg:col-span-8 bg-surface border border-surface2 rounded-2xl p-6 shadow-sm hover:border-accent/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text">Login Activity</h3>
              <p className="text-xs text-muted">Periodic login volume fluctuations</p>
            </div>
            <div className="p-2 bg-surface2 rounded-lg">
              <Calendar className="w-4 h-4 text-muted" />
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts.loginActivity}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => val.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Device Breakdown — Pie */}
        <div className="lg:col-span-4 bg-surface border border-surface2 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-text mb-2">Device Usage</h3>
          <p className="text-xs text-muted mb-6">Traffic distribution by platform type</p>
          
          <div className="flex-1 h-[250px] relative">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.deviceBreakdown}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {data?.charts.deviceBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Laptop className="w-6 h-6 text-muted/40" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {data?.charts.deviceBreakdown.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-semibold text-text">{d.name}</span>
                <span className="text-xs text-muted ml-auto">{((d.value / data.charts.deviceBreakdown.reduce((a:any,b:any)=>a+b.value,0)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Usage — Horizontal Bar */}
        <div className="lg:col-span-6 bg-surface border border-surface2 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text mb-6">Preferred Features</h3>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.charts.featureUsage} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="var(--muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip cursor={{ fill: 'var(--surface2)' }} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="var(--success)" 
                    radius={[0, 6, 6, 0]} 
                    barSize={24}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Retention / Engagement — Linear Area */}
        <div className="lg:col-span-6 bg-surface border border-surface2 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text mb-6">Active User Retention</h3>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts.retention}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="step" 
                    dataKey="count" 
                    stroke="var(--warning)" 
                    strokeWidth={2} 
                    fill="var(--warning)" 
                    fillOpacity={0.1}
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Location Table — Grid Column */}
        <div className="lg:col-span-12">
          {isLoading ? (
             <div className="h-48 bg-surface border border-surface2 animate-pulse rounded-2xl"></div>
          ) : (
            <LocationTable locations={data?.locations || []} />
          )}
        </div>

      </div>
    </div>
  );
}
