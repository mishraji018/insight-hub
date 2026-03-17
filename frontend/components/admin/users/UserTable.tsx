"use client";

import { 
  MoreHorizontal, 
  Shield, 
  User as UserIcon, 
  UserX, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onAction: (userId: string, action: 'view' | 'ban' | 'activate' | 'role' | 'delete') => void;
}

export function UserTable({ users, onAction }: UserTableProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-surface2 bg-surface">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface2/50 border-b border-surface2">
            <th className="px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider">User</th>
            <th className="px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider">Role</th>
            <th className="px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
            <th className="px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider">Joined</th>
            <th className="px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface2">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-surface2/30 transition-colors group">
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (user.firstName?.[0] || user.email[0]).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'No Name'}
                    </div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  user.role === 'ADMIN' ? "text-accent bg-accent/10" : "text-muted bg-surface2"
                )}>
                  {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                  {user.role}
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  user.isActive ? "text-success bg-success/10" : "text-danger bg-danger/10"
                )}>
                  {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : < Ban className="w-3 h-3" />}
                  {user.isActive ? 'Active' : 'Banned'}
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-muted">
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onAction(user.id, 'view')}
                    className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onAction(user.id, user.isActive ? 'ban' : 'activate')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      user.isActive ? "text-muted hover:text-danger hover:bg-danger/10" : "text-muted hover:text-success hover:bg-success/10"
                    )}
                    title={user.isActive ? "Ban User" : "Activate User"}
                  >
                    {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => onAction(user.id, 'delete')}
                    className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
