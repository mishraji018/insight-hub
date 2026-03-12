import { useState, useEffect } from "react";
import axiosInstance from "@/api/client";
import {
    UserPlus,
    Hourglass,
    CheckCircle2,
    XCircle,
    Copy,
    ExternalLink,
    Search,
    Filter,
    MinusCircle,
    Share2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Invite {
    token: string;
    note?: string;
    is_used: boolean;
    is_expired: boolean;
    used_by_email?: string;
    invite_link: string;
}

interface PendingUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    date_joined: string;
    invite_used?: string;
    invite_note?: string;
}

interface UserItem {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_approved: boolean;
    date_joined: string;
}

const AdminPanelPage = () => {
    const [activeTab, setActiveTab] = useState("invites");
    const [invites, setInvites] = useState<Invite[]>([]);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [allUsers, setAllUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteNote, setInviteNote] = useState("");
    const [generatedInvite, setGeneratedInvite] = useState<{ invite_link: string } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "invites") {
                const res = await axiosInstance.get("/api/admin/invite/list/");
                setInvites(res.data);
            } else if (activeTab === "pending") {
                const res = await axiosInstance.get("/api/admin/users/pending/");
                setPendingUsers(res.data);
            } else if (activeTab === "users") {
                const res = await axiosInstance.get("/api/admin/users/");
                setAllUsers(res.data);
            }
        } catch (e) {
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleGenerateInvite = async () => {
        try {
            const res = await axiosInstance.post("/api/admin/invite/generate/", { note: inviteNote });
            setGeneratedInvite(res.data);
            setInviteNote("");
            fetchData();
            toast.success("Invite generated!");
        } catch (e) {
            toast.error("Failed to generate invite");
        }
    };

    const handleApprove = async (userId: number, role: string) => {
        if (!role || role === 'pending') {
            toast.error("Please select a role first");
            return;
        }
        try {
            await axiosInstance.patch(`/api/admin/users/${userId}/assign-role/`, { role });
            toast.success("User approved!");
            fetchData();
        } catch (e) {
            toast.error("Approve failed");
        }
    };

    const handleRevoke = async (userId: number) => {
        try {
            await axiosInstance.patch(`/api/admin/users/${userId}/revoke/`, {});
            toast.success("Access revoked");
            fetchData();
        } catch (e) {
            toast.error("Revoke failed");
        }
    };

    const handleDeleteInvite = async (token: string) => {
        try {
            await axiosInstance.delete(`/api/admin/invite/${token}/delete/`);
            toast.success("Invite deleted");
            fetchData();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Control Center</h1>
                    <p className="text-muted-foreground mt-1">Manage invites, approvals and user permissions</p>
                </div>

                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab("invites")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'invites' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Invites
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Pending {pendingUsers.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-[8px] animate-pulse">{pendingUsers.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        All Users
                    </button>
                </div>
            </div>

            {activeTab === "invites" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="glass-card p-6 border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold">Generate New Invite</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Reference Note</label>
                                    <input
                                        value={inviteNote}
                                        onChange={(e) => setInviteNote(e.target.value)}
                                        placeholder="e.g. Sales Manager North Region"
                                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateInvite}
                                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Create Secure Invite Link
                                </button>
                            </div>

                            {generatedInvite && (
                                <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-widest">Invite Link Ready</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mb-4">{generatedInvite.invite_link}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => copyToClipboard(generatedInvite.invite_link)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all"
                                        >
                                            <Copy className="h-3.5 w-3.5" /> Copy
                                        </button>
                                        
                                        <a
                                            href={`https://wa.me/?text=You have been invited to Insight Hub. Register here: ${generatedInvite.invite_link}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all"
                                        >
                                            <Share2 className="h-3.5 w-3.5" /> WhatsApp
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-2">
                        <div className="glass-card p-0 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4 text-primary" /> Active Invites
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                            <th className="px-6 py-4">Token</th>
                                            <th className="px-6 py-4">For (Note)</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {invites.map((inv) => (
                                            <tr key={inv.token} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs text-primary">{inv.token}</td>
                                                <td className="px-6 py-4 text-xs font-medium">{inv.note || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {inv.is_used ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-[9px] font-bold">Used by {inv.used_by_email}</span>
                                                    ) : inv.is_expired ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold">Expired</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!inv.is_used && (
                                                        <button
                                                            onClick={() => handleDeleteInvite(inv.token)}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <MinusCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "pending" && (
                <div className="glass-card p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Registered On</th>
                                    <th className="px-6 py-4">Invite Used</th>
                                    <th className="px-6 py-4">Assign Role</th>
                                    <th className="px-6 py-4 text-right">Approve</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                                                <p className="text-sm font-medium text-white/20">All caught up! No pending approvals.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {pendingUsers.map((u) => (
                                    <PendingUserRow key={u.id} user={u} onApprove={handleApprove} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "users" && (
                <div className="glass-card p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input placeholder="Search users..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:border-primary outline-none transition-all" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-all">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {allUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                    {u.first_name?.[0] || u.email?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{u.first_name} {u.last_name}</p>
                                                    <p className="text-[10px] text-white/30">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                                u.role === 'executive' ? 'bg-purple-500/20 text-purple-500' :
                                                u.role === 'analyst' ? 'bg-blue-500/20 text-blue-500' :
                                                u.role === 'manager' ? 'bg-emerald-500/20 text-emerald-500' :
                                                'bg-white/10 text-white/40'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px]">
                                            {u.is_approved ? (
                                                <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="h-3 w-3" /> Approved</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-white/20"><Hourglass className="h-3 w-3" /> Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-white/30">
                                            {new Date(u.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.is_approved ? (
                                                <button
                                                    onClick={() => handleRevoke(u.id)}
                                                    className="text-[10px] font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                                                >
                                                    Revoke Access
                                                </button>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const PendingUserRow = ({ user, onApprove }: { user: PendingUser, onApprove: (id: number, role: string) => void }) => {
    const [role, setRole] = useState("pending");

    return (
        <tr className="hover:bg-white/5 transition-colors bg-amber-500/5 group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold">
                        {user.first_name?.[0] || user.email?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-white/30">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-[10px] text-white/40">
                {new Date(user.date_joined).toLocaleString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-primary">{user.invite_used || 'Direct?'}</span>
                    <span className="text-[10px] text-white/20 italic">{user.invite_note}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-primary"
                >
                    <option value="pending">Choose Role</option>
                    <option value="executive">Executive</option>
                    <option value="analyst">Analyst</option>
                    <option value="manager">Manager</option>
                </select>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onApprove(user.id, role)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default AdminPanelPage;