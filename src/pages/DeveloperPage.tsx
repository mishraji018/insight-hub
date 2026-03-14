import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import api, { APIKey } from '@/api/endpoints';
import { 
  Key, 
  Plus, 
  Trash2, 
  Power, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Code2, 
  BookOpen, 
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

const DeveloperPage = () => {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const data = await api.developer.getKeys();
            setKeys(data);
        } catch (error) {
            toast.error("Failed to load API keys");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setIsCreating(true);
        try {
            const response = await api.developer.createKey(newKeyName);
            setKeys([...keys, response]);
            setNewlyCreatedKey(response.key);
            setShowKeyModal(true);
            setNewKeyName("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create key");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleKey = async (id: number) => {
        try {
            const { is_active } = await api.developer.toggleKey(id);
            setKeys(keys.map(k => k.id === id ? { ...k, is_active } : k));
            toast.success(is_active ? "Key activated" : "Key deactivated");
        } catch (error) {
            toast.error("Failed to toggle key status");
        }
    };

    const handleDeleteKey = async (id: number) => {
        if (!window.confirm("Permanently delete this API key?")) return;
        try {
            await api.developer.deleteKey(id);
            setKeys(keys.filter(k => k.id !== id));
            toast.success("Key deleted");
        } catch (error) {
            toast.error("Failed to delete key");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic">
                            Developer <span className="text-primary not-italic">Portal</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Programmatic Access & Integrations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Key Management Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass-card border-none shadow-2xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">API Credentials</CardTitle>
                                    <CardDescription>Secure keys to access our public endpoints</CardDescription>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Key className="h-5 w-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleCreateKey} className="flex gap-3">
                                    <input 
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        placeholder="Key name (e.g. Production Backend)"
                                        className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/5 focus:border-primary outline-none transition-all font-bold text-sm"
                                    />
                                    <button 
                                        disabled={!newKeyName || isCreating}
                                        className="px-6 h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        Generate Key
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {loading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="h-20 w-full rounded-2xl bg-white/5 animate-pulse" />
                                        ))
                                    ) : keys.length === 0 ? (
                                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                            <ShieldCheck className="h-10 w-10 text-white/5 mx-auto mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No active keys found</p>
                                        </div>
                                    ) : (
                                        keys.map(key => (
                                            <div key={key.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${key.is_active ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/20'}`}>
                                                        <Zap className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-black ${!key.is_active && 'opacity-30'}`}>{key.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <code className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{key.prefix}••••••••</code>
                                                            <span className="h-1 w-1 rounded-full bg-white/10" />
                                                            <p className="text-[9px] font-bold text-white/20 uppercase">
                                                                {key.last_used ? `Used ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleToggleKey(key.id)}
                                                        className={`p-2 rounded-xl transition-all ${key.is_active ? 'text-primary hover:bg-primary/10' : 'text-white/20 hover:bg-white/10'}`}
                                                        title={key.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteKey(key.id)}
                                                        className="p-2 rounded-xl text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-none shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Quick Start Guide</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="h-4 w-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Bash / CURL</span>
                                        </div>
                                        <button onClick={() => copyToClipboard('curl -H "Authorization: Bearer YOUR_KEY" https://api.insighthub.com/v1/predictions/')} className="hover:text-primary transition-colors">
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <code className="block text-[11px] font-mono text-emerald-500/80 leading-relaxed overflow-x-auto whitespace-nowrap pb-2">
                                        curl -H "Authorization: Bearer <span className="text-emerald-500">ih_xxxx.yyyy</span>" \<br/>
                                        &nbsp;&nbsp;https://api.insighthub.com/v1/predictions/
                                    </code>
                                </div>

                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-4 w-4 text-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Node.js / Axios</span>
                                        </div>
                                    </div>
                                    <code className="block text-[11px] font-mono text-blue-400/80 leading-relaxed overflow-x-auto pb-1">
                                        const response = await axios.get('/api/v1/usage', &#123;<br/>
                                        &nbsp;&nbsp;headers: &#123; Authorization: `Bearer $&#123;API_KEY&#125;` &#125;<br/>
                                        &#125;);
                                    </code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* API Status / Meta */}
                    <div className="space-y-6">
                        <Card className="glass-card border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <CardTitle>Usage Limits</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Rate Limit</span>
                                    <span className="text-xs font-black">1,000 req/hr</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-1/3" />
                                </div>
                                <p className="text-[9px] text-muted-foreground font-bold leading-relaxed italic">
                                    Enterprise customers can request higher limits via support.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-none shadow-xl">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    <CardTitle>Documentation</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between group transition-all">
                                    <span className="text-xs font-bold">Comprehensive API Docs</span>
                                    <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100" />
                                </button>
                                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between group transition-all">
                                    <span className="text-xs font-bold">Webhooks Integration</span>
                                    <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100" />
                                </button>
                                <button className="w-full p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 flex items-center gap-2 justify-center py-4 font-black text-[10px] uppercase tracking-widest mt-4">
                                    <CheckCircle2 className="h-3 w-3" /> System Operational
                                </button>
                            </CardContent>
                        </Card>

                        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex gap-4">
                            <Info className="h-5 w-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-tighter">
                                API Keys grant full access to your account. Never share them or commit them to source control.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newly Created Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                    <Card className="relative w-full max-w-md glass-card border-none shadow-[0_0_100px_rgba(var(--primary),0.3)] rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center pb-2">
                             <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircle2 className="h-8 w-8 text-primary" />
                             </div>
                             <CardTitle className="text-2xl font-black italic">Key <span className="not-italic text-primary">Generated</span></CardTitle>
                             <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Only shown once — Save it now!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4 text-center">
                                <p className="text-xs text-muted-foreground px-4">
                                    Copy this key and store it securely. You will not be able to see it again.
                                </p>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                    <code className="flex-1 text-sm font-black tracking-wider text-primary break-all select-all">{newlyCreatedKey}</code>
                                    <button onClick={() => newlyCreatedKey && copyToClipboard(newlyCreatedKey)} className="p-2 rounded-xl hover:bg-primary/20 text-primary transition-all">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowKeyModal(false); setNewlyCreatedKey(null); }}
                                className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all"
                            >
                                I've saved the key
                            </button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
};

export default DeveloperPage;
