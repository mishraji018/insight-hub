"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Key, Plus, Copy, Trash2, ShieldCheck, 
  Code, Terminal, Globe, Activity, Check, 
  AlertCircle, Clock, ExternalLink, ChevronRight,
  Lock, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Skeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  isActive: boolean;
  rateLimit: number;
  createdAt: string;
}

interface UsageStats {
  totalCallsMonth: number;
  callsToday: number;
  successRate: number;
  activeKeysCount: number;
  rateLimit: {
    limit: number;
    remaining: number;
    resetIn: string;
  };
}

const mockUsageData = [
  { time: '00:00', calls: 120 },
  { time: '04:00', calls: 80 },
  { time: '08:00', calls: 450 },
  { time: '12:00', calls: 860 },
  { time: '16:00', calls: 1200 },
  { time: '20:00', calls: 950 },
  { time: '23:59', calls: 300 },
];

export default function DeveloperPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, statsRes] = await Promise.all([
        fetch('/api/developer/keys'),
        fetch('/api/developer/stats')
      ]);
      
      if (keysRes.ok && statsRes.ok) {
        setKeys(await keysRes.json());
        setStats(await statsRes.json());
      }
    } catch (error) {
      toast.error('Failed to load developer data');
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('keyName') as string;

    if (!name) return;

    setCreating(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey({ name: data.name, key: data.key });
        await fetchData();
        toast.success('API Key generated successfully');
        e.currentTarget.reset();
      } else {
        toast.error('Failed to generate API Key');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
        toast.success('API Key revoked');
        fetchData();
      } else {
        toast.error('Failed to revoke key');
      }
    } catch (error) {
      toast.error('Error revoking key');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20 page-enter">
      
      {/* ── Header Section ── */}
      <div className="bg-surface/70 backdrop-blur-xl border border-surface2 p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Zap className="w-6 h-6 text-accent animate-pulse-subtle" />
              </div>
              <h1 className="text-3xl font-black text-text tracking-tighter uppercase">Developer Portal</h1>
            </div>
            <p className="text-sm font-medium text-muted/80 max-w-lg italic">
              Empower your applications with Insight Hub's high-performance APIs and real-time data syncs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface2/50 rounded-xl border border-surface2 text-[10px] font-black uppercase tracking-widest text-muted">
              < Globe className="w-3.5 h-3.5 text-accent" />
              API V1.0 - Stable
            </div>
            <button 
              onClick={fetchData}
              className="p-2.5 bg-surface2/50 hover:bg-surface2 rounded-xl transition-all border border-surface2 text-muted hover:text-accent"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Usage Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Usage</span>
              </div>
              <h3 className="text-2xl font-black text-text">{stats?.totalCallsMonth.toLocaleString()}</h3>
              <p className="text-[10px] text-muted font-bold mt-1 uppercase">Monthly Requests</p>
            </div>

            <div className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-success/10 rounded-lg text-success">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Health</span>
              </div>
              <h3 className="text-2xl font-black text-text">{stats?.successRate}%</h3>
              <div className="w-full bg-surface2 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-success h-full shadow-glow-sm" style={{ width: `${stats?.successRate}%` }}></div>
              </div>
            </div>

            <div className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-warning/10 rounded-lg text-warning">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Speed</span>
              </div>
              <h3 className="text-2xl font-black text-text">124ms</h3>
              <p className="text-[10px] text-muted font-bold mt-1 uppercase">Avg Latency</p>
            </div>

            <div className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Quota</span>
              </div>
              <h3 className="text-2xl font-black text-text">
                {stats ? ((stats.rateLimit.remaining / stats.rateLimit.limit) * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-tighter italic">Resets in {stats?.rateLimit.resetIn}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── API Keys & Chart (Left/Center) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Usage Chart */}
          <div className="card p-6 overflow-hidden">
            <h3 className="text-xs font-black text-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              API Traffic (Last 24h)
            </h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockUsageData}>
                  <defs>
                    <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--muted)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontWeight: 800 }}
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                    tick={{ fontWeight: 800 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 800, color: 'var(--text)', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#usageGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* API Keys Management */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text tracking-tight uppercase">API Keys</h2>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60 italic">Manage keys used to authenticate requests</p>
              </div>
            </div>

            <div className="space-y-4">
              {loading && keys.length === 0 ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-20 bg-surface2/50 animate-pulse rounded-2xl" />
                ))
              ) : keys.length === 0 ? (
                <div className="text-center py-16 bg-background/30 rounded-3xl border-2 border-dashed border-surface2/50">
                   <div className="w-16 h-16 bg-surface2/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-muted/30" />
                   </div>
                  <p className="text-xs font-black text-text uppercase tracking-widest">No API keys found</p>
                  <p className="text-[10px] text-muted mt-2 font-bold uppercase tracking-tighter italic">Generate your first secret key below to get started</p>
                </div>
              ) : (
                keys.map((key) => (
                   <div key={key.id} className="group flex items-center justify-between p-5 bg-background/50 border border-surface2 rounded-2xl hover:border-accent/30 hover:bg-accent/5 transition-all transition-bounce">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-surface2/50 flex items-center justify-center text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors shadow-sm">
                          <Terminal className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-text uppercase tracking-tight">{key.name}</p>
                          <div className="flex items-center gap-2 font-mono text-[10px] mt-1.5">
                             <span className="text-muted/60">ih_{key.prefix}****************</span>
                             <button 
                               onClick={() => copyToClipboard(`ih_${key.prefix}...`, key.id)}
                               className="hover:text-accent p-1 transition-colors"
                             >
                               {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted/40" />}
                             </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] text-muted uppercase font-black opacity-50 tracking-widest">Last Used</p>
                          <p className="text-[10px] font-black text-text uppercase mt-0.5">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Never'}
                          </p>
                        </div>
                        <button 
                          onClick={() => revokeKey(key.id)}
                          className="p-3 text-muted/40 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                ))
              )}
            </div>

            {/* Create New Key Form */}
            <div className="mt-10 pt-8 border-t border-surface2/50">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 italic">Generate Master Secret</h3>
              <form onSubmit={generateKey} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  name="keyName"
                  placeholder="Production Server, Home Automation, etc."
                  required
                  className="flex-1 bg-background/50 border border-surface2 rounded-2xl px-5 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted/40"
                />
                <button 
                  type="submit"
                  disabled={creating}
                  className="px-8 py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-sm flex items-center justify-center gap-2 group"
                >
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />}
                  Generate Key
                </button>
              </form>
            </div>
          </div>

          {/* New Key Display (One-time) */}
          {newKey && (
            <div className="bg-accent/10 border border-accent/20 rounded-3xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-500 shadow-glow-sm">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setNewKey(null)} className="text-accent/50 hover:text-accent p-2 hover:bg-accent/10 rounded-xl transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-accent/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-accent" />
                 </div>
                 <h4 className="text-sm font-black text-accent uppercase tracking-widest">Security Warning</h4>
              </div>
              <p className="text-xs text-text/80 mb-6 leading-relaxed font-bold uppercase tracking-tight">
                This secret key for <span className="text-accent">"{newKey.name}"</span> is shown only once. <span className="underline">Please save it immediately</span> in a secure vault.
              </p>
              <div className="bg-surface2/50 backdrop-blur-md border border-accent/20 rounded-2xl p-5 flex items-center justify-between gap-4 font-mono text-sm overflow-hidden">
                <code className="text-accent font-black break-all">{newKey.key}</code>
                <button 
                  onClick={() => copyToClipboard(newKey.key, 'new')}
                  className="flex-shrink-0 p-3 bg-accent text-white rounded-xl transition-all shadow-glow-sm hover:scale-105 active:scale-95"
                >
                  {copiedId === 'new' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Documentation & Resources (Right) ── */}
        <div className="space-y-6">
          <div className="card p-8">
            <h3 className="text-xs font-black text-text uppercase tracking-widest flex items-center gap-2 mb-8">
              <Code className="w-5 h-5 text-accent" />
              Developer Docs
            </h3>
            
            <div className="space-y-8">
              <div className="group">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 opacity-70 group-hover:text-accent transition-colors">Authentication</p>
                <div className="bg-background/50 rounded-2xl p-4 border border-surface2 font-mono text-xs relative overflow-hidden group/box">
                  <div className="flex items-center justify-between text-muted mb-3 opacity-60">
                    <span className="text-[9px] font-black uppercase tracking-tighter italic">cURL Request</span>
                    <button onClick={() => copyToClipboard('curl -H "Authorization: Bearer YOUR_KEY"', 'doc1')}><Copy className="w-3.5 h-3.5 hover:text-accent transition-colors" /></button>
                  </div>
                  <code className="text-text/80 block leading-relaxed tracking-tighter overflow-x-auto whitespace-pre italic">
                    <span className="text-accent">curl</span> -X GET "https://api.ih.io/v1/health" \<br/>
                    -H <span className="text-success">"Authorization: Bearer ih_..."</span>
                  </code>
                </div>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 opacity-70 group-hover:text-accent transition-colors">SDK Examples</p>
                <div className="bg-background/50 rounded-2xl p-4 border border-surface2 font-mono text-xs group/box">
                  <div className="flex items-center justify-between text-muted mb-3 opacity-60">
                    <span className="text-[9px] font-black uppercase tracking-tighter italic">Node.js ES6</span>
                    <button onClick={() => copyToClipboard('const hub = new InsightHub(...)', 'doc2')}><Copy className="w-3.5 h-3.5 hover:text-accent transition-colors" /></button>
                  </div>
                  <code className="text-text/60 block leading-relaxed overflow-x-auto whitespace-pre italic">
                    <span className="text-accent">import</span> &#123; Hub &#125; <span className="text-accent">from</span> <span className="text-success">'insighthub'</span>;<br/><br/>
                    <span className="text-accent">const</span> client = <span className="text-accent">new</span> Hub(&#123;<br/>
                    &nbsp;&nbsp;apiKey: <span className="text-success">'ih_...'</span><br/>
                    &#125;);
                  </code>
                </div>
              </div>

              <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <ShieldCheck className="w-12 h-12 text-accent" />
                 </div>
                 <p className="text-[11px] font-black text-text flex items-center gap-2 uppercase tracking-tight">
                   Security Guidelines
                 </p>
                 <ul className="mt-4 space-y-3">
                    {[
                      'Rotate keys every 90 days',
                      'Never commit keys to Git',
                      'Restrict IP access in settings'
                    ].map((tip, i) => (
                      <li key={i} className="text-[10px] text-muted flex items-center gap-3 font-bold uppercase tracking-tight italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {tip}
                      </li>
                    ))}
                 </ul>
              </div>

              <a 
                href="#" 
                className="flex items-center justify-between p-4 bg-surface2/50 hover:bg-accent hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group/link"
              >
                Full API Reference
                <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          <div className="card p-8 bg-surface/40">
             <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-accent" />
                <h4 className="text-xs font-black text-text uppercase tracking-widest">Webhooks</h4>
             </div>
             <p className="text-[10px] font-medium text-muted/70 leading-relaxed uppercase tracking-widest italic">
               Receive real-time notifications about events in your account. Webhook management is coming in <span className="text-accent font-black">V1.1</span>.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reuse existing Lucide icon correctly if needed
function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
