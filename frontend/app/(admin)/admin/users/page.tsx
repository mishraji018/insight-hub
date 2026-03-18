"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../(dashboard)/layout';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserModals } from '@/components/admin/users/UserModals';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  UserX, 
  UserPlus, 
  Activity,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadCsv } from '@/lib/export';
import toast from 'react-hot-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [modalType, setModalType] = useState<'none' | 'view' | 'delete'>('none');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        q: search,
        role: roleFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAction = async (userId: string, action: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (!user) return;

    if (action === 'view') {
      setSelectedUser(user);
      setModalType('view');
    } else if (action === 'delete') {
      setSelectedUser(user);
      setModalType('delete');
    } else if (action === 'ban' || action === 'activate') {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: action === 'activate' }),
        });
        if (res.ok) fetchUsers();
      } catch (err) {
        console.error('Update failed:', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        setModalType('none');
        fetchUsers();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    // @ts-expect-error Layout prop
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6 page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              User Management
            </h1>
            <p className="text-sm text-muted">Monitor and moderate all platform accounts</p>
          </div>
          <button 
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/users?all=true');
                const data = await res.json();
                downloadCsv(data.users, 'insight_hub_users');
                toast.success('User list exported successfully');
              } catch (err) {
                toast.error('Failed to export user list');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-surface2 hover:bg-surface2/80 text-text rounded-xl text-sm font-bold transition-all border border-surface2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.total || 0, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Active Today', value: stats?.active || 0, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Banned Users', value: stats?.banned || 0, icon: UserX, color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'New This Month', value: stats?.newThisMonth || 0, icon: UserPlus, color: 'text-warning', bg: 'bg-warning/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm group">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-text">{loading ? '...' : stat.value.toLocaleString()}</h3>
                <div className="flex items-center text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full mb-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Live
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-4 bg-surface border border-surface2 p-4 rounded-xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface2 border border-surface2 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface2 border border-surface2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="all">All Roles</option>
              <option value="USER">Users Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface2 border border-surface2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
               <LoadingSpinner size="lg" />
            </div>
          )}
          {!loading && users.length === 0 ? (
            <EmptyState 
              title="No users found"
              description="Your search didn't match any platform accounts. Try a different query or adjust your filters."
              icon={Users}
              className="bg-surface border-surface2 py-24"
            />
          ) : (
            <UserTable users={users} onAction={handleAction} />
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-surface border border-surface2 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-muted font-medium">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-surface2 rounded-lg hover:bg-surface2 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-surface2 rounded-lg hover:bg-surface2 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <UserModals 
        type={modalType} 
        user={selectedUser} 
        onClose={() => setModalType('none')} 
        onConfirm={modalType === 'delete' ? confirmDelete : () => setModalType('none')}
      />
    </DashboardLayout>
  );
}
