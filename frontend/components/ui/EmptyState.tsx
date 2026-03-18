import { LucideIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = Search, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-12 bg-surface/50 border border-surface2/50 rounded-[40px] animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden",
      className
    )}>
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-surface to-surface2 border border-surface2 flex items-center justify-center mb-8 relative group shadow-premium-sm">
        <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/20 to-transparent rounded-[32px] opacity-50" />
        <Icon className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-500" />
      </div>

      <h3 className="text-2xl font-black text-text mb-3 tracking-tight uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-muted max-w-[280px] mb-10 font-black uppercase tracking-widest opacity-60 leading-relaxed">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-sm hover:scale-105 active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
