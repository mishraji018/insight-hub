"use client";

import { useState, useEffect } from 'react';
import { 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, Laptop, Share2, ShieldCheck, Globe } from 'lucide-react';
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)'];

export default function PublicAnalyticsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicAnalytics() {
      // Mocking public data fetch - in a real app, this would use the share token 'id'
      try {
        const res = await fetch(`/api/analytics/advanced?range=30d`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch public analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicAnalytics();
  }, []);

  if (!data && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <h1 className="text-2xl font-bold text-text mb-2 text-center text-balance">Invalid or Expired Link</h1>
        <p className="text-muted text-center max-w-md">This analytics dashboard is no longer public or the link is incorrect.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Banner */}
      <div className="bg-accent/10 border-b border-accent/20 py-2 px-6 flex items-center justify-center gap-2">
        <Globe className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold text-accent uppercase tracking-widest">Public View Mode (Read-Only)</span>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between bg-surface border border-surface2 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="text-[10px] font-bold text-success uppercase tracking-tighter">Verified Snapshot</span>
            </div>
            <h1 className="text-3xl font-black text-text tracking-tight">Analytics Snapshot</h1>
            <p className="text-sm text-muted mt-1 font-medium">Platform performance shared from Insight Hub</p>
          </div>
          <div className="p-4 bg-surface2 rounded-2xl border border-surface2 hidden md:block">
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
        </div>

        <AnalyticsStats 
           stats={data?.stats || { totalUsers: 0, activeToday: 0, newThisWeek: 0, churnRate: '0%' }} 
           isLoading={isLoading} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
           {/* Charts — simplified layout for public view */}
           <div className="lg:col-span-8 bg-surface border border-surface2 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text mb-6">Login Activity (Last 30 Days)</h3>
              <div className="h-[300px] w-full">
                {isLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.charts.loginActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '12px' }}
                        itemStyle={{ color: 'var(--text)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
           </div>

           <div className="lg:col-span-4 bg-surface border border-surface2 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-text mb-6">Device Distribution</h3>
              <div className="h-[250px]">
                {isLoading ? <div className="w-full h-full bg-surface2 animate-pulse rounded-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.charts.deviceBreakdown}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.charts.deviceBreakdown.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-2 mt-4">
                 {data?.charts.deviceBreakdown.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs font-bold text-text uppercase">{d.name}</span>
                       </div>
                       <span className="text-xs font-mono text-muted">{d.value} hits</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="text-center pb-12">
           <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Want insights like these for your business?</p>
           <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-text text-background rounded-full font-black text-sm hover:scale-105 transition-transform uppercase tracking-tighter">
             Get Started with Insight Hub
           </a>
        </div>
      </div>
    </div>
  );
}
