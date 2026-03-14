import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/endpoints';
import { Organisation, OrgMember } from '@/api/endpoints';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Plus, 
  Loader2, 
  ChevronRight,
  Share2,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

const TeamPage = () => {
    const user = useAuthStore(s => s.user);
  const activeOrgId = useAuthStore(s => s.activeOrgId);
  const setActiveOrgId = useAuthStore(s => s.setActiveOrgId);
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    
    // Forms
    const [newOrgName, setNewOrgName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        fetchOrganisations();
    }, []);

    useEffect(() => {
        if (activeOrgId && organisations.length > 0) {
            const org = organisations.find(o => o.id === activeOrgId) || organisations[0];
            setSelectedOrg(org);
            if (org.id !== activeOrgId) setActiveOrgId(org.id);
            fetchMembers(org.id);
        } else if (organisations.length > 0) {
            setSelectedOrg(organisations[0]);
            setActiveOrgId(organisations[0].id);
            fetchMembers(organisations[0].id);
        } else {
            setLoading(false);
        }
    }, [organisations]);

    const fetchOrganisations = async () => {
        try {
            const data = await api.org.getOrganisations();
            setOrganisations(data);
        } catch (error) {
            console.error("Failed to fetch organisations");
        }
    };

    const fetchMembers = async (orgId: number) => {
        setLoading(true);
        try {
            const data = await api.org.getMembers(orgId);
            setMembers(data);
        } catch (error) {
            toast.error("Failed to fetch members");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setActionLoading('create');
        try {
            const org = await api.org.createOrganisation(newOrgName);
            setOrganisations([...organisations, org]);
            setShowCreateModal(false);
            setNewOrgName("");
            setActiveOrgId(org.id);
            toast.success("Organisation created!");
        } catch (error) {
            toast.error("Failed to create organisation");
        } finally {
            setActionLoading(null);
        }
    };

    const handleJoinOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;
        setActionLoading('join');
        try {
            const response = await api.org.join(inviteCode);
            toast.success(response.message);
            setShowJoinModal(false);
            setInviteCode("");
            fetchOrganisations();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to join");
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerateInvite = async () => {
        if (!selectedOrg) return;
        setActionLoading('invite');
        try {
            const { invite_code } = await api.org.generateInvite(selectedOrg.id);
            const updatedOrg = { ...selectedOrg, invite_code };
            setSelectedOrg(updatedOrg);
            setOrganisations(organisations.map(o => o.id === selectedOrg.id ? updatedOrg : o));
            toast.success("Invite code generated!");
        } catch (error) {
            toast.error("Failed to generate code");
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangeRole = async (memberId: number, role: string) => {
        if (!selectedOrg) return;
        try {
            await api.org.changeRole(selectedOrg.id, memberId, role);
            toast.success("Role updated");
            fetchMembers(selectedOrg.id);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update role");
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!selectedOrg) return;
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await api.org.removeMember(selectedOrg.id, memberId);
            toast.success("Member removed");
            setMembers(members.filter(m => m.id !== memberId));
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    const copyInviteCode = () => {
        if (!selectedOrg?.invite_code) return;
        navigator.clipboard.writeText(selectedOrg.invite_code);
        toast.success("Invite code copied!");
    };

    const userInOrg = members.find(m => m.user === user?.id);
    const isOwnerOrAdmin = userInOrg?.role === 'owner' || userInOrg?.role === 'admin';

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic">
                            Team <span className="text-primary not-italic">Management</span>
                        </h1>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Collaborative Governance & Roles</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowJoinModal(true)}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Join Organisation
                        </button>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Create Team
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar: Organisation List */}
                    <div className="lg:col-span-1 space-y-4">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Your Organisations</p>
                        <div className="space-y-3">
                            {organisations.length === 0 && !loading ? (
                                <div className="p-8 text-center glass-card border-dashed border-2 border-white/5">
                                    <Users className="h-8 w-8 text-white/10 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-white/20 uppercase">No teams yet</p>
                                </div>
                            ) : (
                                organisations.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => {
                                            setSelectedOrg(org);
                                            setActiveOrgId(org.id);
                                            fetchMembers(org.id);
                                        }}
                                        className={`w-full p-4 rounded-3xl text-left transition-all border flex items-center justify-between group ${
                                            selectedOrg?.id === org.id 
                                            ? 'bg-primary/10 border-primary/20 shadow-lg shadow-primary/5' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${
                                                selectedOrg?.id === org.id ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'
                                            }`}>
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black">{org.name}</p>
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter capitalize">{org.plan_name} Plan</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 transition-transform ${selectedOrg?.id === org.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-50'}`} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content: Members & Settings */}
                    <div className="lg:col-span-3 space-y-8">
                        {selectedOrg ? (
                            <>
                                {/* Header / Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-transparent">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <ShieldCheck className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-primary tracking-widest">Active Focus</p>
                                                    <h3 className="text-xl font-black">{selectedOrg.name}</h3>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card border-none">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Team Size</p>
                                                    <h3 className="text-xl font-black">{members.length} Members</h3>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card border-none border-l-4 border-l-primary/50">
                                        <CardContent className="pt-6 relative">
                                            {isOwnerOrAdmin ? (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Invite Code</p>
                                                    {selectedOrg.invite_code ? (
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-lg font-black tracking-widest text-primary">{selectedOrg.invite_code}</code>
                                                            <button onClick={copyInviteCode} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={handleGenerateInvite}
                                                            disabled={actionLoading === 'invite'}
                                                            className="flex items-center gap-2 text-primary text-xs font-black uppercase hover:underline"
                                                        >
                                                            {actionLoading === 'invite' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
                                                            Generate Link
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                     <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Your Role</p>
                                                     <h3 className="text-xl font-black capitalize">{userInOrg?.role || 'Member'}</h3>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Members List */}
                                <Card className="glass-card border-none shadow-2xl overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">Team Members</CardTitle>
                                            <CardDescription>Manage your organisation's workforce and permissions</CardDescription>
                                        </div>
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {loading ? (
                                                 Array.from({ length: 3 }).map((_, i) => (
                                                    <div key={i} className="h-16 w-full rounded-2xl bg-white/5 animate-pulse" />
                                                 ))
                                            ) : (
                                                members.map(member => (
                                                    <div key={member.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.07] transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-background border border-white/5 flex items-center justify-center">
                                                                <span className="text-lg font-black text-primary">{member.user_name?.charAt(0) || '?'}</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-black">{member.user_name}</p>
                                                                    {member.role === 'owner' && <ShieldCheck className="h-3 w-3 text-primary" />}
                                                                </div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{member.user_email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col md:items-end">
                                                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Permission Tier</p>
                                                                {isOwnerOrAdmin && member.user !== user?.id && member.role !== 'owner' ? (
                                                                    <select 
                                                                        value={member.role}
                                                                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                                                        className="bg-transparent text-xs font-black uppercase outline-none text-primary cursor-pointer hover:underline"
                                                                    >
                                                                        <option value="admin">Admin</option>
                                                                        <option value="member">Member</option>
                                                                        <option value="viewer">Viewer</option>
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-xs font-black uppercase text-primary">{member.role}</span>
                                                                )}
                                                            </div>

                                                            <div className="h-10 w-px bg-white/5 hidden md:block" />

                                                            <div className="flex items-center gap-4">
                                                                <div className="hidden md:block">
                                                                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Joined Date</p>
                                                                    <p className="text-[10px] font-bold">{new Date(member.joined_at).toLocaleDateString()}</p>
                                                                </div>
                                                                
                                                                {isOwnerOrAdmin && member.user !== user?.id && member.role !== 'owner' && (
                                                                    <button 
                                                                        onClick={() => handleRemoveMember(member.id)}
                                                                        className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 glass-card border-none rounded-[3rem]">
                                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6">
                                    <Users className="h-12 w-12 text-primary/40" />
                                </div>
                                <h2 className="text-3xl font-black italic mb-2">Setup Your <span className="text-primary not-italic">Organization</span></h2>
                                <p className="text-muted-foreground max-w-sm mb-8 text-sm font-medium">Create a team to collaborate with others, manage shared projects, and unlock enterprise governance features.</p>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setShowJoinModal(true)}
                                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Join Existing
                                    </button>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-8 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                    >
                                        Create New Team
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
                    <Card className="relative w-full max-w-md glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black italic">Create <span className="text-primary not-italic">Team</span></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateOrg} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Organisation Name</label>
                                    <input 
                                        autoFocus
                                        value={newOrgName}
                                        onChange={e => setNewOrgName(e.target.value)}
                                        placeholder="e.g. Acme Corporation"
                                        className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-black text-lg"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={!newOrgName || actionLoading === 'create'}
                                        className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Org"}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowJoinModal(false)} />
                    <Card className="relative w-full max-w-md glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black italic">Join <span className="text-primary not-italic">Organisation</span></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinOrg} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Invite Code</label>
                                    <input 
                                        autoFocus
                                        value={inviteCode}
                                        onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="ABC123XYZ"
                                        className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-black text-2xl tracking-[0.3em] text-center"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={!inviteCode || actionLoading === 'join'}
                                        className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === 'join' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Team"}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
};

export default TeamPage;
