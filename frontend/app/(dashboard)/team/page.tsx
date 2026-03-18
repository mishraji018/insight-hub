"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserPlus, Search, Filter, MoreHorizontal, 
  Shield, User, Mail, Calendar, CheckCircle2, 
  XCircle, Trash2, Download, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/team/members');
        if (res.ok) {
          const json = await res.json();
          setMembers(json.members);
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  return (
    <div className="space-y-6 page-enter pb-12">
      {/* Header Section */}
      <div className="card border border-surface2 rounded-2xl p-5 shadow-sm group">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-accent" />
            <h1 className="text-2xl font-black text-text tracking-tight">Team Directory</h1>
          </div>
          <p className="text-[11px] font-black text-muted uppercase tracking-widest opacity-60 italic">
            Manage roles, permissions and organization access
          </p>
        </div>
        
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow-sm group"
        >
          <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Invite Member
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length, icon: Users, color: 'accent' },
          { label: 'Administrators', value: members.filter(m => m.orgRole === 'ADMIN').length, icon: Shield, color: 'accent' },
          { label: 'Active Now', value: members.filter(m => m.status === 'Active').length, icon: CheckCircle2, color: 'success' },
          { label: 'Pending Invites', value: 0, icon: Mail, color: 'warning' },
        ].map((stat, i) => (
          <div key={i} className="card p-5 group flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-text tracking-tight h-8">
                {isLoading ? (
                  <div className="w-12 h-6 bg-surface2 animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </h3>
            </div>
            <div className={cn(
               "p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-glow-sm",
               stat.color === 'accent' ? "bg-accent/10 text-accent" :
               stat.color === 'success' ? "bg-success/10 text-success" :
               "bg-warning/10 text-warning"
            )}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-surface2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedMembers.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <span className="text-xs font-black text-accent uppercase tracking-widest mr-2">
                {selectedMembers.length} Selected
              </span>
              <button 
                className="p-2.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition-colors border border-danger/10"
                onClick={() => toast.error("Bulk delete restricted for demo")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-surface2/50 text-text hover:bg-surface2 rounded-xl transition-colors border border-surface2">
                <Download className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-6 bg-surface2 mx-2" />
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-surface2 hover:bg-surface2/50 text-text rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface2/30 border-b border-surface2">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox"
                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-surface2 text-accent focus:ring-accent accent-accent cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="w-4 h-4 bg-surface2 animate-pulse rounded" /></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface2 animate-pulse rounded-full" />
                        <div className="space-y-2">
                          <div className="w-24 h-3 bg-surface2 animate-pulse rounded" />
                          <div className="w-32 h-2 bg-surface2 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="w-16 h-4 bg-surface2 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-5"><div className="w-12 h-4 bg-surface2 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-5"><div className="w-20 h-3 bg-surface2 animate-pulse rounded" /></td>
                    <td className="px-6 py-5 text-right"><div className="w-8 h-8 bg-surface2 animate-pulse rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <Users className="w-12 h-12 text-muted" />
                      <p className="text-sm font-bold text-muted uppercase tracking-widest">No members found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-accent/5 group/row transition-colors">
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleSelect(member.id)}
                      className="w-4 h-4 rounded border-surface2 text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-accent/50 transition-all shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-black text-sm uppercase shadow-sm">
                            {member.name[0]}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-surface rounded-full shadow-sm" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-text tracking-tight flex items-center gap-1.5 uppercase">
                          {member.name}
                          {member.orgRole === 'ADMIN' && <Shield className="w-3 h-3 text-accent" />}
                        </h4>
                        <p className="text-[10px] font-medium text-muted/70 tracking-tight">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                      member.orgRole === 'ADMIN' ? "bg-accent/10 text-accent shadow-sm" : "bg-surface2 text-muted"
                    )}>
                      {member.orgRole}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      {member.status === 'Active' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-danger" />
                      )}
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        member.status === 'Active' ? "text-success" : "text-danger"
                      )}>
                        {member.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-muted opacity-80">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-surface2 rounded-lg transition-colors group/btn">
                      <MoreHorizontal className="w-4 h-4 text-muted group-hover/btn:text-text" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsInviteOpen(false)} />
          <div className="relative w-full max-w-lg bg-surface border border-surface2 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-surface2/50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
            
            <div className="mb-8">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-text tracking-tight uppercase">Invite Team Member</h2>
              <p className="text-xs font-medium text-muted mt-1 uppercase tracking-widest opacity-60 italic">Send an invitation to join your workspace</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success("Invitation sent!"); setIsInviteOpen(false); }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-surface2/30 border border-surface2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Role Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['MEMBER', 'ADMIN'].map((role) => (
                    <div key={role} className="relative group">
                      <input 
                        type="radio" 
                        name="role" 
                        id={role} 
                        defaultChecked={role === 'MEMBER'}
                        className="peer hidden"
                      />
                      <label 
                        htmlFor={role}
                        className="flex items-center justify-center gap-2 p-3.5 bg-surface2/20 border-2 border-transparent rounded-xl cursor-pointer peer-checked:border-accent peer-checked:bg-accent/5 transition-all"
                      >
                        <Shield className="w-4 h-4 text-muted peer-checked:text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest peer-checked:text-accent">{role}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 px-4 py-4 bg-surface2/50 text-text rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface2 transition-all border border-surface2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-4 py-4 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-glow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
