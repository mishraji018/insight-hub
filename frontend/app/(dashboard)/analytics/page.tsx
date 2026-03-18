"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell as RechartsCell
} from 'recharts';
import { Filter, Download, Calendar, TrendingUp, Laptop, Smartphone, Tablet, Share2, ArrowUpRight, ArrowDownRight, Zap, AlertTriangle, CheckCircle2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadCsv } from '@/lib/export';
import toast from 'react-hot-toast';
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats';
import { LocationTable } from '@/components/analytics/LocationTable';
import { Skeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays } from 'date-fns';

const COLORS = ['#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const rangeOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        let url = `/api/analytics/advanced?range=${range}`;
        if (range === 'custom' && startDate && endDate) {
          url += `&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
        }
        const res = await fetch(url);
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
  }, [range, startDate, endDate]);

  const ProStatsRow = () => {
    const stats = [
      { label: 'User Retention', value: data?.stats.retentionRate || '0%', trend: '+4.2%', isUp: true, icon: TrendingUp },
      { label: 'Conversion Rate', value: data?.stats.conversionRate || '0%', trend: '+1.5%', isUp: true, icon: Zap },
      { label: 'Bounce Rate', value: data?.stats.bounceRate || '0%', trend: '-2.4%', isUp: false, icon: AlertTriangle },
      { label: 'Avg Session', value: data?.stats.avgSessionDuration || '0m', trend: '+0.8m', isUp: true, icon: Calendar },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-accent/5 text-accent rounded-xl group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                s.isUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {s.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </div>
            </div>
            <h3 className="text-2xl font-black text-text tracking-tight">{isLoading ? '...' : s.value}</h3>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">{s.label}</p>
          </div>
        ))}
      </div>
    );
  };

  const ActivityHeatmap = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="card p-5 overflow-x-auto thin-scrollbar">
        <h3 className="text-sm font-black text-text uppercase tracking-widest mb-6">Hourly Activity Heatmap</h3>
        <div className="min-w-[700px]">
          <div className="flex mb-2">
            <div className="w-10" />
            {hours.filter(h => h % 2 === 0).map(h => (
              <div key={h} className="flex-1 text-[8px] font-black text-muted text-center uppercase">{h}h</div>
            ))}
          </div>
          {days.map((day, dIdx) => (
            <div key={day} className="flex gap-1 mb-1">
              <div className="w-10 text-[9px] font-black text-muted uppercase flex items-center">{day}</div>
              {hours.map(h => {
                const activity = data?.charts.heatmap?.find((hm: any) => hm.day === dIdx && hm.hour === h)?.value || 0;
                const opacity = Math.min(activity / 5, 1);
                return (
                  <div 
                    key={h} 
                    className="flex-1 h-6 rounded-sm bg-accent/5 relative group"
                    style={{ backgroundColor: `rgba(var(--accent-rgb), ${opacity})` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {activity} visits at {h}:00
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const InsightsBox = () => {
    const insights = [
      { type: 'success', text: 'Login activity increased 12% this week', icon: TrendingUp },
      { type: 'accent', text: 'Profile Settings is most used feature', icon: Zap },
      { type: 'warning', text: '3 users inactive for 7+ days', icon: AlertTriangle },
    ];

    return (
      <div className="space-y-3">
        <h3 className="text-xs font-black text-text uppercase tracking-widest px-1">AI Smart Insights</h3>
        {insights.map((insight, i) => (
          <div key={i} className={cn(
            "p-3 rounded-xl border flex items-center gap-3 animate-in slide-in-from-right-4 fill-mode-both",
            insight.type === 'success' && "bg-success/5 border-success/10 text-success",
            insight.type === 'accent' && "bg-accent/5 border-accent/10 text-accent",
            insight.type === 'warning' && "bg-warning/5 border-warning/10 text-warning",
          )} style={{ animationDelay: `${i * 100}ms` }}>
            <insight.icon className="w-4 h-4 flex-shrink-0" />
            <p className="text-[11px] font-bold tracking-tight">{insight.text}</p>
          </div>
        ))}
      </div>
    );
  };

  const TopPagesTable = () => {
    const pages = [
      { name: '/dashboard', views: '1,240', time: '4m 12s', bounce: '12%' },
      { name: '/analytics', views: '850', time: '6m 45s', bounce: '8%' },
      { name: '/profile', views: '420', time: '1m 20s', bounce: '45%' },
      { name: '/team', views: '210', time: '2m 10s', bounce: '15%' },
    ];

    return (
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface2 flex items-center justify-between">
          <h3 className="text-sm font-black text-text uppercase tracking-widest">Top Visited Pages</h3>
          <MoreVertical className="w-4 h-4 text-muted cursor-pointer" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface2/30">
                <th className="px-5 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Page Name</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Views</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Avg Time</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Bounce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface2">
              {pages.map((page, i) => (
                <tr key={i} className="hover:bg-accent/5 transition-colors">
                  <td className="px-5 py-4 text-xs font-bold text-text">{page.name}</td>
                  <td className="px-5 py-4 text-xs font-bold text-text">{page.views}</td>
                  <td className="px-5 py-4 text-xs font-bold text-text">{page.time}</td>
                  <td className="px-5 py-4 text-xs font-bold text-text">
                    <span className="px-1.5 py-0.5 bg-success/10 text-success rounded-md text-[9px] font-black">{page.bounce}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/70 backdrop-blur-xl border border-surface2 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            Pro Analytics
            <TrendingUp className="w-5 h-5 text-accent animate-bounce-subtle" />
          </h1>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Deep behavioral insights & performance metrics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-surface2/50 rounded-xl p-1 border border-surface2">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  range === opt.value 
                    ? "bg-accent text-white shadow-card" 
                    : "text-muted hover:text-text"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update: any) => {
                setDateRange(update);
                if (update[0] && update[1]) setRange('custom');
              }}
              placeholderText="Custom Range"
              className="pl-9 pr-4 py-2 bg-surface2/50 border border-surface2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent transition-all w-[240px] cursor-pointer"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
            />
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
          </div>
          
          <button 
            onClick={() => {
              toast.success('Generating full report...');
              downloadCsv(data?.charts.loginActivity, `analytics_full_report_${range}`);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <ProStatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Activity — Improved Area */}
        <div className="lg:col-span-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-widest">User Activity</h3>
              <p className="text-[10px] font-medium text-muted mt-1 opacity-60 italic">Daily login volume over the selected period</p>
            </div>
            <div className="p-2 bg-accent/5 text-accent rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts.loginActivity}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="bold" />
                  <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" />
                  <Tooltip content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="card p-6 border-l-4 border-l-accent">
                          <p className="text-[10px] font-black text-accent uppercase mb-1">{label}</p>
                          <p className="text-sm font-black text-text">{payload[0].value.toLocaleString()} Logins</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Device Breakdown — Pie */}
        <div className="lg:col-span-4 card p-6 flex flex-col">
          <h3 className="text-sm font-black text-text uppercase tracking-widest mb-1">Device Breakdown</h3>
          <p className="text-[10px] font-medium text-muted mb-6 opacity-60">Traffic by platform share</p>
          
          <div className="flex-1 h-[250px] relative">
            {isLoading ? <Skeleton className="w-full h-full rounded-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.deviceBreakdown}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {data?.charts.deviceBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            {data?.charts.deviceBreakdown.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-surface2/20 rounded-lg">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-black text-text uppercase tracking-tighter truncate">{d.name}</span>
                <span className="text-[10px] font-black text-accent ml-auto">{((d.value / data.charts.deviceBreakdown.reduce((a:any,b:any)=>a+b.value,0)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Activity Heatmap */}
        <div className="lg:col-span-12">
           <ActivityHeatmap />
        </div>

        {/* Left Column: Feature Usage + Top Pages */}
        <div className="lg:col-span-8 space-y-6">
           <div className="card p-6">
              <h3 className="text-sm font-black text-text uppercase tracking-widest mb-6">Feature Usage (Popularity)</h3>
              <div className="h-[280px]">
                {isLoading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.charts.featureUsage} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="var(--muted)" fontSize={10} fontStyle="bold" tickLine={false} axisLine={false} width={100} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500}>
                        {data?.charts.featureUsage.map((_: any, index: number) => (
                           <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
           </div>
           
           <TopPagesTable />
        </div>

        {/* Right Column: Retention + Insights */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card p-6">
              <h3 className="text-sm font-black text-text uppercase tracking-widest mb-6">User Retention</h3>
              <div className="h-[200px]">
                {isLoading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.charts.retention}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} animationDuration={1500} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4 p-4 bg-success/5 rounded-xl border border-success/10 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Steady Growth</span>
                 </div>
                 <span className="text-xs font-black text-success">+14% this month</span>
              </div>
           </div>

           <InsightsBox />

           <LocationTable locations={data?.locations || []} />
        </div>

      </div>
    </div>
  );
}
