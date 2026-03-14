import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { adminAPI, AdminStats, AdminUser, AuditLog } from "@/api/endpoints";
import { 
    Users, 
    ShieldAlert, 
    Activity, 
    Search, 
    Unlock, 
    Lock, 
    LogOut,
    TrendingUp,
    CheckCircle2,
    XCircle,
    FileDown,
    Filter,
    Clock,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from "recharts";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    
    // Audit Log State
    const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotalPages, setAuditTotalPages] = useState(1);
    const [auditActionFilter, setAuditActionFilter] = useState("");
    const [auditUserFilter, setAuditUserFilter] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, u] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(search)
            ]);
            setStats(s);
            setUsers(u);
        } catch (error) {
            toast.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const handleUserAction = async (userId: number, action: 'unlock' | 'toggle_active' | 'force_logout') => {
        setActionLoading(userId);
        try {
            await adminAPI.performUserAction(userId, action);
            toast.success(`Action ${action.replace('_', ' ')} successful`);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setActionLoading(null);
        }
    };
    const fetchAuditLogs = async (page = 1) => {
        setAuditLoading(true);
        try {
            const data = await adminAPI.getAuditLogs({
                page,
                action: auditActionFilter,
                user: auditUserFilter
            });
            setAuditLogs(data.results);
            setAuditTotalPages(data.total_pages);
            setAuditPage(data.current_page);
        } catch (error) {
            toast.error("Failed to fetch audit logs");
        } finally {
            setAuditLoading(false);
        }
    };

    const handleExportAudit = async () => {
        try {
            const blob = await adminAPI.exportAuditLogs();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Audit log exported");
        } catch (error) {
            toast.error("Export failed");
        }
    };

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs(1);
        }
    }, [activeTab, auditActionFilter, auditUserFilter]);

    const statsLoading = loading && !stats;
    const usersLoading = loading && users.length === 0;

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic">
                            Super <span className="text-primary not-italic">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Administrative Control & Intelligence</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats?.total_users, sub: `+${stats?.new_this_month} this month`, icon: Users, color: 'primary' },
                        { label: 'Active Today', value: stats?.active_today, sub: `${stats?.total_logins_today} sessions today`, icon: Activity, color: 'blue-500' },
                        { label: 'Security Alerts', value: stats?.failed_logins_today, sub: 'Failed logins today', icon: ShieldAlert, color: 'destructive' },
                        { label: 'Locked Accounts', value: stats?.locked_accounts_count, sub: 'Requires intervention', icon: Lock, color: 'amber-500' }
                    ].map((item, i) => (
                        <Card key={i} className={`glass-card border-none shadow-xl ${item.color === 'primary' ? 'border-l-4 border-l-primary' : item.color === 'amber-500' ? 'border-l-4 border-l-amber-500' : ''}`}>
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest">{item.label}</CardDescription>
                                <CardTitle className={`text-3xl font-black flex items-center justify-between ${item.color === 'destructive' ? 'text-destructive' : ''}`}>
                                    {statsLoading ? <Skeleton className="h-8 w-20" /> : item.value || 0}
                                    <item.icon className={`h-5 w-5 ${item.color === 'blue-500' ? 'text-blue-500/40' : item.color === 'amber-500' ? 'text-amber-500/40' : item.color === 'destructive' ? 'opacity-40' : 'text-primary/40'}`} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Skeleton className="h-3 w-24" />
                                ) : (
                                    <p className={`text-[10px] font-bold flex items-center gap-1 ${item.color === 'primary' ? 'text-emerald-500' : item.color === 'destructive' ? 'text-destructive/80 italic' : 'text-muted-foreground'}`}>
                                        {item.color === 'primary' && <TrendingUp className="h-3 w-3" />}
                                        {item.sub}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 glass-card border-none shadow-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg italic font-black">User <span className="text-primary not-italic">Growth</span></CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Last 12 Months Registration Trend</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.user_growth || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                        stroke="rgba(255,255,255,0.3)"
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                        stroke="rgba(255,255,255,0.3)" 
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '1rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} 
                                        labelStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={4} 
                                        dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 glass-card border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg italic font-black">Feature <span className="text-primary not-italic">Usage</span></CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Most Accessed Components</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            {statsLoading ? (
                                <div className="h-full w-full flex flex-col gap-4 p-4">
                                    <Skeleton className="h-full w-full rounded-2xl" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={stats?.most_used_features || []} margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="feature_name" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 'bold' }} 
                                            stroke="rgba(255,255,255,0.5)"
                                            width={80}
                                        />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '0.5rem' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {(stats?.most_used_features || []).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table Card */}
                <Card className="glass-card border-none shadow-2xl overflow-hidden">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center gap-2 pb-2 transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-black uppercase tracking-widest">User Management</span>
                                {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />}
                            </button>
                            <button 
                                onClick={() => setActiveTab('audit')}
                                className={`flex items-center gap-2 pb-2 transition-all relative ${activeTab === 'audit' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <History className="h-4 w-4" />
                                <span className="text-sm font-black uppercase tracking-widest">Audit Log</span>
                                {activeTab === 'audit' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {activeTab === 'users' ? (
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input 
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search users..."
                                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-primary outline-none transition-all w-64"
                                    />
                                </form>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input 
                                            type="text"
                                            value={auditUserFilter}
                                            onChange={(e) => setAuditUserFilter(e.target.value)}
                                            placeholder="Filter by user email..."
                                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-primary outline-none transition-all w-64"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <select 
                                            value={auditActionFilter}
                                            onChange={(e) => setAuditActionFilter(e.target.value)}
                                            className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer h-full"
                                        >
                                            <option value="">All Actions</option>
                                            <option value="LOGIN_SUCCESS">Login Success</option>
                                            <option value="PASSWORD_CHANGED">Password Change</option>
                                            <option value="2FA_ENABLED">2FA Enabled</option>
                                            <option value="ADMIN_USER_UNLOCKED">Admin Unlock</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleExportAudit}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 h-full"
                                    >
                                        <FileDown className="h-3.5 w-3.5" />
                                        Export CSV
                                    </button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activeTab === 'users' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Info</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined / Last Login</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activity</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {usersLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                                </tr>
                                            ))
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Users className="h-12 w-12" />
                                                        <p className="text-sm font-black uppercase tracking-[0.3em]">No Users Found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((u) => (
                                                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{u.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {u.is_locked ? (
                                                                <span className="px-2 py-1 bg-destructive/10 text-destructive text-[9px] font-black uppercase rounded-lg border border-destructive/20 flex items-center gap-1">
                                                                    <Lock className="h-3 w-3" /> Locked
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" /> Secure
                                                                </span>
                                                            )}
                                                            {u.two_fa_enabled ? (
                                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase rounded-lg border border-blue-500/20">2FA On</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-white/5 text-white/40 text-[9px] font-black uppercase rounded-lg">2FA Off</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[11px] font-bold">{new Date(u.joined).toLocaleDateString()}</p>
                                                        <p className="text-[9px] text-muted-foreground italic">
                                                            Last: {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                           <div className="text-center">
                                                             <p className="text-xs font-black">{u.login_count}</p>
                                                             <p className="text-[8px] uppercase font-bold text-muted-foreground">Logins</p>
                                                           </div>
                                                           <div className={`h-2 w-2 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} title={u.is_active ? 'Active' : 'Offline'} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {u.is_locked && (
                                                                <button 
                                                                    onClick={() => handleUserAction(u.id, 'unlock')}
                                                                    disabled={actionLoading === u.id}
                                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                                                    title="Unlock Account"
                                                                >
                                                                    <Unlock className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleUserAction(u.id, 'toggle_active')}
                                                                disabled={actionLoading === u.id}
                                                                className={`p-2 rounded-lg transition-all shadow-lg ${u.is_active ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white shadow-destructive/10' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-primary/10'}`}
                                                                title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                                                            >
                                                                {u.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUserAction(u.id, 'force_logout')}
                                                                disabled={actionLoading === u.id}
                                                                className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10"
                                                                title="Force Logout"
                                                            >
                                                                <LogOut className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Context</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">IP / Browser</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {auditLoading ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                                        <td className="px-6 py-4"><Skeleton className="h-6 w-40" /></td>
                                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                                    </tr>
                                                ))
                                            ) : auditLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                                            <History className="h-12 w-12" />
                                                            <p className="text-sm font-black uppercase tracking-[0.3em]">No Audit Logs Found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                auditLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                <p className="text-[11px] font-bold">{new Date(log.created_at).toLocaleString()}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                                log.action.includes('LOGIN_SUCCESS') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                log.action.includes('FAILED') || log.action.includes('LOCKED') ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                                                log.action.includes('ADMIN') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                            }`}>
                                                                {log.action.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <p className="text-xs font-bold">{log.user_email || 'System'}</p>
                                                                {log.target_user_email && (
                                                                    <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                                                                        Target: <span className="text-foreground">{log.target_user_email}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <p className="text-[10px] font-mono text-muted-foreground">{log.ip_address}</p>
                                                                <p className="text-[9px] text-muted-foreground/60 truncate max-w-[200px] mt-0.5">{log.user_agent}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Footer */}
                                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Page {auditPage} of {auditTotalPages}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => fetchAuditLogs(auditPage - 1)}
                                            disabled={auditPage === 1 || auditLoading}
                                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 disabled:opacity-30 transition-all"
                                        >
                                            Prev
                                        </button>
                                        <button 
                                            onClick={() => fetchAuditLogs(auditPage + 1)}
                                            disabled={auditPage === auditTotalPages || auditLoading}
                                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 disabled:opacity-30 transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminDashboardPage;
