"use client";

import { X, AlertTriangle, User as UserIcon, Mail, Calendar, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserModalsProps {
  type: 'none' | 'view' | 'delete';
  user: any;
  onClose: () => void;
  onConfirm: () => void;
}

export function UserModals({ type, user, onClose, onConfirm }: UserModalsProps) {
  if (type === 'none' || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={cn(
        "bg-surface border border-surface2 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200",
        type === 'delete' ? "border-danger/20" : "border-accent/10"
      )}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface2">
          <h3 className="text-lg font-bold text-text capitalize">
            {type === 'view' ? 'User Details' : 'Confirm Deletion'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-text hover:bg-surface2 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'view' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : user.email[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-text truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'No Name Set'}
                  </h4>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-3 bg-surface2/50 rounded-xl space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Role</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-text">
                    <Shield className="w-4 h-4 text-accent" />
                    {user.role}
                  </div>
                </div>
                <div className="p-3 bg-surface2/50 rounded-xl space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Status</p>
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-bold",
                    user.isActive ? "text-success" : "text-danger"
                  )}>
                    <CheckCircle2 className="w-4 h-4" />
                    {user.isActive ? 'Active' : 'Banned'}
                  </div>
                </div>
                <div className="p-3 bg-surface2/50 rounded-xl space-y-1 col-span-2">
                  <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Joined On</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-text">
                    <Calendar className="w-4 h-4 text-muted" />
                    {format(new Date(user.createdAt), 'MMMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text">Are you absolutely sure?</h4>
                <p className="text-sm text-muted mt-1 px-4">
                  This will permanently delete the account for <span className="text-text font-bold">{user.email}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-surface2/30 border-t border-surface2 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted hover:text-text transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-glow-sm",
              type === 'delete' ? "bg-danger hover:bg-danger/90" : "bg-accent hover:bg-accent/90"
            )}
          >
            {type === 'delete' ? 'Delete User' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
