"use client";

import { useState } from 'react';
import { Plus, UserPlus, FileDown, Zap, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'New Campaign', icon: Zap,       onClick: () => toast.success('Starting new campaign...') },
    { label: 'Invite User',  icon: UserPlus,  onClick: () => toast.success('Opening invite modal...') },
    { label: 'Export Data',  icon: FileDown,  onClick: () => toast.success('Preparing export...') },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ripple-btn border",
          isOpen 
            ? "bg-accent text-white border-accent shadow-glow-sm" 
            : "bg-surface2 text-text border-surface2 hover:bg-surface2/80"
        )}
      >
        <Plus className={cn("w-4 h-4 transition-transform", isOpen && "rotate-45")} />
        <span className="hidden sm:inline uppercase tracking-widest">Actions</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute right-0 mt-2 w-48 bg-surface/95 backdrop-blur-xl border border-surface2 rounded-2xl shadow-premium z-50 overflow-hidden",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}>
            <div className="p-2 space-y-1">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent hover:text-white transition-all group"
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-tight">{action.label}</span>
                  <Sparkles className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
