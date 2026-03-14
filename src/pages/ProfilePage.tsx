import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/authStore";
import { authAPI, billingAPI, UserSession } from "@/api/endpoints";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  History, 
  Smartphone, 
  Globe,
  Camera,
  Edit2,
  Loader2,
  CheckCircle2,
  Activity,
  Trophy,
  Download,
  FileJson,
  FileSpreadsheet,
  Monitor,
  Trash2,
  AlertCircle,
  QrCode, 
  ShieldCheck, 
  DownloadCloud,
  ShieldAlert,
  CreditCard,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = () => {
    const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const toggleTheme = useAuthStore(s => s.toggleTheme);
  const checkAuth = useAuthStore(s => s.checkAuth);
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<'json' | 'pdf' | null>(null);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFAData, setTwoFAData] = useState<{ secret: string; qr_code: string } | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [billingUsage, setBillingUsage] = useState<any>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    
    const [nameForm, setNameForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || ''
    });

    const [prefsForm, setPrefsForm] = useState({
        digest_enabled: user?.digest_enabled || false,
        security_alerts_enabled: user?.security_alerts_enabled || false
    });

    useEffect(() => {
        if (user) {
            setPrefsForm({
                digest_enabled: user.digest_enabled || false,
                security_alerts_enabled: user.security_alerts_enabled || false
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [history, userStats, activeSessions, billingData] = await Promise.all([
                    authAPI.getLoginHistory(),
                    authAPI.getUserStats(),
                    authAPI.getSessions(),
                    billingAPI.getUsage()
                ]);
                setLoginHistory(history);
                setStats(userStats);
                setSessions(activeSessions);
                setBillingUsage(billingData);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        authAPI.trackActivity('Profile Page');
    }, []);

    const handleRevokeSession = async (id: number) => {
        try {
            await authAPI.revokeSession(id);
            setSessions(sessions.filter(s => s.id !== id));
            toast.success("Session revoked");
        } catch (error) {
            toast.error("Failed to revoke session");
        }
    };

    const handleRevokeAll = async () => {
        try {
            await authAPI.revokeAllSessions();
            setSessions([]);
            toast.success("Other sessions cleared");
        } catch (error) {
            toast.error("Failed to clear sessions");
        }
    };

    const handleExport = async (format: 'json' | 'pdf') => {
        setExporting(format);
        try {
            const data = await authAPI.exportData(format);
            const blob = format === 'pdf' ? data : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `insight_hub_data_${user?.email}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success(`${format.toUpperCase()} export complete!`);
        } catch (error) {
            toast.error("Export failed");
        } finally {
            setExporting(null);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await authAPI.uploadAvatar(file);
            toast.success("Avatar updated!");
            // Refresh page or update store
            window.location.reload();
        } catch (error) {
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(nameForm);
            toast.success("Profile updated!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Update failed.");
        }
    };

    const handleUpdatePrefs = async (key: 'digest_enabled' | 'security_alerts_enabled', value: boolean) => {
        try {
            const newPrefs = { ...prefsForm, [key]: value };
            setPrefsForm(newPrefs);
            await updateProfile(newPrefs);
            toast.success("Preferences updated!");
        } catch (error) {
            toast.error("Failed to update preferences.");
            setPrefsForm(prefsForm); // Reset on error
        }
    };

    const handleSetup2FA = async () => {
        setTwoFALoading(true);
        try {
            const data = await authAPI.setup2FA();
            setTwoFAData(data);
            setShow2FASetup(true);
            setOtpCode("");
            setBackupCodes(null);
        } catch (error) {
            toast.error("Failed to initialize 2FA setup");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!otpCode) return;
        setTwoFALoading(true);
        try {
            const data = await authAPI.enable2FA(otpCode);
            setBackupCodes(data.backup_codes);
            toast.success("2FA Enabled Successfully!");
            // Refresh user state in store
            checkAuth();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Verification failed");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!disablePassword || !otpCode) {
            toast.error("Password and OTP are required");
            return;
        }
        setTwoFALoading(true);
        try {
            await authAPI.disable2FA({ password: disablePassword, otp_code: otpCode });
            toast.success("2FA Disabled");
            setShowDisable2FA(false);
            setDisablePassword("");
            setOtpCode("");
            checkAuth();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to disable 2FA");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handlePortalRedirect = async () => {
        setPortalLoading(true);
        try {
            const response = await billingAPI.createPortal();
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to open portal");
        } finally {
            setPortalLoading(false);
        }
    };

    const downloadBackupCodes = () => {
        if (!backupCodes) return;
        const text = `Insight Hub 2FA Backup Codes\nKeep these in a safe place!\n\n${backupCodes.join('\n')}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'insight_hub_backup_codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic">
                            Profile <span className="text-primary not-italic">Account</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Identity & Engagement Metrics</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Main Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="glass-card border-none shadow-2xl overflow-hidden group">
                            <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                                <button 
                                    onClick={toggleTheme}
                                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    {user?.theme_preference === 'dark' ? '🌙' : '☀️'}
                                </button>
                            </div>
                            <CardContent className="relative pt-0 flex flex-col items-center">
                                <div className="relative -mt-12 mb-6 group/avatar">
                                    <div className="h-32 w-32 rounded-3xl bg-background border-4 border-background shadow-2xl overflow-hidden relative">
                                        {user?.avatar ? (
                                            <img src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                                <User className="h-16 w-16 text-primary" />
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl border-4 border-background">
                                        <Camera className="h-5 w-5" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    </label>
                                </div>

                                <div className="text-center space-y-1">
                                    <h2 className="text-xl font-black">
                                        {loading ? <Skeleton className="h-6 w-32 mx-auto" /> : (user?.name || 'Incomplete Profile')}
                                    </h2>
                                    <p className="text-[10px] uppercase font-bold text-primary tracking-widest">
                                        {loading ? <Skeleton className="h-3 w-16 mx-auto" /> : user?.role}
                                    </p>
                                </div>

                                <div className="w-full mt-8 space-y-3">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-bold truncate">{user?.email}</span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-bold">Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            {user?.is_approved ? 'Official Verified' : 'Awaiting Check'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4 rounded-3xl text-center space-y-1">
                                <Activity className="h-4 w-4 text-primary mx-auto mb-2" />
                                <div className="text-xl font-black">
                                    {loading ? <Skeleton className="h-6 w-10 mx-auto" /> : (stats?.total_logins || 0)}
                                </div>
                                <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Sessions</div>
                            </div>
                            <div className="glass-card p-4 rounded-3xl text-center space-y-1">
                                <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-2" />
                                <div className="text-xl font-black">
                                    {loading ? <Skeleton className="h-6 w-10 mx-auto" /> : (stats?.days_active || 0)}
                                </div>
                                <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Days Active</div>
                            </div>
                        </div>

                        {/* Subscription & Usage */}
                        <Card className="glass-card border-none shadow-2xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-xl">Subscription</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Active Plan</p>
                                        <span className="px-2 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest font-mono">
                                             {billingUsage?.plan_name || 'FREE'}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-black capitalize">{billingUsage?.plan_name || 'Free Tier'}</h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-xs font-bold">Query Usage</p>
                                        </div>
                                        <p className="text-xs font-black">{billingUsage?.usage || 0} / {billingUsage?.limit || 100}</p>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000" 
                                            style={{ width: `${Math.min(((billingUsage?.usage || 0) / (billingUsage?.limit || 100)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold text-center tracking-tighter">
                                        {billingUsage?.remaining || 0} Queries remaining this month
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    {billingUsage?.plan_name === 'free' || !billingUsage?.plan_name ? (
                                        <button 
                                            onClick={() => window.location.href = '/pricing'}
                                            className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                                        >
                                            Upgrade Plan
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handlePortalRedirect}
                                            disabled={portalLoading}
                                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                        >
                                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                                            Manage Billing
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Interactive Edit Section */}
                        <Card className="glass-card border-none shadow-2xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Personal Information</CardTitle>
                                    <CardDescription>Update your public facing identity</CardDescription>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group"
                                >
                                    <Edit2 className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </button>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleUpdateName} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                            <input 
                                                value={nameForm.first_name}
                                                onChange={e => setNameForm({...nameForm, first_name: e.target.value})}
                                                className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-primary outline-none transition-all font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                            <input 
                                                value={nameForm.last_name}
                                                onChange={e => setNameForm({...nameForm, last_name: e.target.value})}
                                                className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-primary outline-none transition-all font-bold" 
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 h-12 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                                            <button type="submit" className="px-6 h-12 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save Changes</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name</p>
                                            <p className="text-lg font-bold">{user?.first_name} {user?.last_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Verified Email</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-bold">{user?.email}</p>
                                                {user?.is_email_verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Security Section (2FA) */}
                        <Card className="glass-card border-none shadow-2xl overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-xl">Account Security</CardTitle>
                                </div>
                                <CardDescription>Enhance your account security with Two-Factor Authentication</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${user?.two_fa_enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/20'}`}>
                                            <QrCode className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">Two-Factor Authentication (2FA)</p>
                                            <p className="text-xs text-muted-foreground font-medium">Use an authenticator app like Google Authenticator or Authy</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {user?.two_fa_enabled ? (
                                            <>
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle2 className="h-3 w-3" /> Enabled
                                                </span>
                                                <button 
                                                    onClick={() => { setShowDisable2FA(true); setOtpCode(""); }}
                                                    className="px-6 py-3 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-all shadow-lg shadow-destructive/10"
                                                >
                                                    Disable
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={handleSetup2FA}
                                                disabled={twoFALoading}
                                                className="w-full md:w-auto px-10 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                            >
                                                {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                                Enable 2FA
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement & Preferences */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <Card className="glass-card border-none shadow-2xl">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Email Preferences</CardTitle>
                                    </div>
                                    <CardDescription>Control your notification and report frequency</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">Weekly Activity Digest</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-medium">Summary of your interaction history</p>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdatePrefs('digest_enabled', !prefsForm.digest_enabled)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${prefsForm.digest_enabled ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefsForm.digest_enabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">Critical Security Alerts</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-medium">Immediate notifications for new logins</p>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdatePrefs('security_alerts_enabled', !prefsForm.security_alerts_enabled)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${prefsForm.security_alerts_enabled ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefsForm.security_alerts_enabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </CardContent>
                             </Card>

                             <Card className="glass-card border-none shadow-2xl">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Download className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Data Ownership</CardTitle>
                                    </div>
                                    <CardDescription>Export your account data for portability</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold">Standard JSON Export</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Machine readable profile & activity</p>
                                            </div>
                                            <button 
                                                onClick={() => handleExport('json')}
                                                disabled={!!exporting}
                                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                {exporting === 'json' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileJson className="h-3 w-3" />}
                                                JSON
                                            </button>
                                        </div>
                                        <div className="h-px bg-white/5 w-full" />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold">Official PDF Report</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Formatted security & interaction summary</p>
                                            </div>
                                            <button 
                                                onClick={() => handleExport('pdf')}
                                                disabled={!!exporting}
                                                className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                {exporting === 'pdf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3 w-3" />}
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>

                        {/* Session Manager */}
                        <Card className="glass-card border-none shadow-2xl">
                             <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        <CardTitle>Browser Sessions</CardTitle>
                                    </div>
                                    <CardDescription>Devices that are currently logged into your account</CardDescription>
                                </div>
                                {sessions.length > 0 && (
                                    <button 
                                        onClick={handleRevokeAll}
                                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                                    >
                                        Sign out all devices
                                    </button>
                                )}
                             </CardHeader>
                             <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sessions.length === 0 ? (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <AlertCircle className="h-8 w-8 text-white/10 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No other active sessions</p>
                                        </div>
                                    ) : (
                                        sessions.map(session => (
                                            <div key={session.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-background border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <Globe className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-white">{session.browser}</p>
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-black uppercase tracking-tighter">
                                                                {session.device_name}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-tight mt-0.5">{session.ip_address || 'Hidden IP'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="p-2 rounded-xl text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                             </CardContent>
                        </Card>

                        {/* Detailed History */}
                        <Card className="glass-card border-none shadow-2xl">
                             <CardHeader>
                                <div className="flex items-center gap-3">
                                    <History className="h-5 w-5 text-primary" />
                                    <CardTitle>Security Logs</CardTitle>
                                </div>
                             </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background/20 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-3 w-32" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : loginHistory.length === 0 ? (
                                        <div className="py-10 text-center opacity-20">
                                            <History className="h-10 w-10 mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No history recorded</p>
                                        </div>
                                    ) : (
                                        loginHistory.slice(0, 5).map((login, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-background/20 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                        {login.device_info === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">{login.browser_info} on {login.device_info}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase">{new Date(login.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em]">Verified Login</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                              </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* 2FA Setup Dialog */}
            {show2FASetup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !backupCodes && setShow2FASetup(false)} />
                    <Card className="relative w-full max-w-md glass-card border-none shadow-[0_0_100px_rgba(var(--primary),0.2)] rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center pb-2">
                             <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <QrCode className="h-8 w-8 text-primary" />
                             </div>
                             <CardTitle className="text-2xl font-black italic">Two-Factor <span className="text-primary not-italic">Setup</span></CardTitle>
                             <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Protect your account with TOTP</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {!backupCodes ? (
                                <>
                                    <div className="space-y-4 text-center">
                                        <p className="text-xs text-muted-foreground px-4">
                                            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator)
                                        </p>
                                        <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl">
                                            {twoFAData?.qr_code && (
                                                <img 
                                                    src={`data:image/png;base64,${twoFAData.qr_code}`} 
                                                    alt="QR Code" 
                                                    className="w-48 h-48"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Secret Key</p>
                                            <code className="text-[12px] font-bold bg-white/5 py-1 px-3 rounded-lg text-primary tracking-widest select-all">{twoFAData?.secret}</code>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Enter 6-Digit Code</label>
                                        <input 
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full h-14 text-center text-3xl font-black tracking-[0.5em] rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
                                        />
                                        <button 
                                            onClick={handleEnable2FA}
                                            disabled={otpCode.length !== 6 || twoFALoading}
                                            className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                            Verify & Enable
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 py-4 animate-in zoom-in duration-500">
                                    <div className="text-center space-y-2">
                                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-black text-emerald-500">2FA Enabled Successfully!</h3>
                                        <p className="text-xs text-muted-foreground">Save these backup codes in a safe place. You can use them if you lose access to your device.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        {backupCodes.map(code => (
                                            <code key={code} className="text-xs font-mono font-bold text-center py-2 bg-black/20 rounded-lg">{code}</code>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-3 pt-2">
                                        <button 
                                            onClick={downloadBackupCodes}
                                            className="w-full py-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                        >
                                            <DownloadCloud className="h-4 w-4" /> Download Codes
                                        </button>
                                        <button 
                                            onClick={() => setShow2FASetup(false)}
                                            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Disable 2FA Dialog */}
            {showDisable2FA && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDisable2FA(false)} />
                    <Card className="relative w-full max-w-sm glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center">
                             <div className="h-16 w-16 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert className="h-8 w-8 text-destructive" />
                             </div>
                             <CardTitle className="text-xl font-black">Disable <span className="text-destructive">2FA</span></CardTitle>
                             <CardDescription className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tighter">Enter your credentials to deactivate</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Current Password</label>
                                <input 
                                    type="password"
                                    value={disablePassword}
                                    onChange={e => setDisablePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-destructive outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">TOTP Code</label>
                                <input 
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-destructive outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowDisable2FA(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                                <button 
                                    onClick={handleDisable2FA}
                                    disabled={!disablePassword || otpCode.length !== 6 || twoFALoading}
                                    className="flex-1 h-12 rounded-xl bg-destructive text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-destructive/20 flex items-center justify-center gap-2"
                                >
                                    {twoFALoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Disable
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
};

export default ProfilePage;
