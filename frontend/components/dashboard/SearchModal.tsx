"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Command, X, LayoutDashboard, LineChart, Users, Settings, CreditCard, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = [
    { name: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard', color: 'accent' },
    { name: 'Analytics',   icon: LineChart,       href: '/analytics', color: 'success' },
    { name: 'Profile',     icon: Settings,        href: '/profile',   color: 'warning' },
    { name: 'Team',        icon: Users,           href: '/team',      color: 'accent' },
    { name: 'Billing',     icon: CreditCard,      href: '/billing',   color: 'accent' },
    { name: 'API Docs',    icon: Code,            href: '/developer', color: 'accent' },
  ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        router.push(results[selectedIndex].href);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, results, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className={cn(
        "w-full max-w-xl bg-surface/90 backdrop-blur-2xl border border-surface2 rounded-3xl shadow-premium overflow-hidden z-10",
        "animate-in zoom-in-95 slide-in-from-top-4 duration-500"
      )}>
        <div className="flex items-center px-5 h-16 border-b border-surface2/50 bg-surface/50">
          <Search className="w-5 h-5 text-accent animate-pulse shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for pages, features, or data..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-[13px] font-black text-text placeholder:text-muted/40 uppercase tracking-widest"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface2 rounded-lg border border-surface2/50">
            <Command className="w-3 h-3 text-muted" />
            <span className="text-[10px] font-black text-muted">ESC</span>
          </div>
        </div>

        <div className="p-3 max-h-[400px] overflow-y-auto thin-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-4 py-2 text-[9px] font-black text-muted uppercase tracking-[0.2em] opacity-40">Quick Results</p>
              {results.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                    selectedIndex === index 
                      ? "bg-accent text-white shadow-glow-sm translate-x-1" 
                      : "hover:bg-surface2/50 text-text"
                  )}
                >
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    selectedIndex === index ? "bg-white/20 scale-110" : "bg-surface2 group-hover:bg-surface group-hover:scale-105"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                  
                  {selectedIndex === index && (
                    <div className="ml-auto flex items-center gap-2">
                       <p className="text-[8px] font-black uppercase tracking-tighter opacity-70">Press Enter</p>
                       <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-muted">
              <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4 opacity-40 ring-1 ring-surface2">
                <X className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No matches for "{query}"</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-background/50 border-t border-surface2/50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-background rounded border border-surface2/50 text-[9px] font-black text-muted">↑↓</span>
              <span className="text-[9px] font-black text-muted/60 uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-background rounded border border-surface2/50 text-[9px] font-black text-muted">↵</span>
              <span className="text-[9px] font-black text-muted/60 uppercase tracking-widest">Select</span>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-50">
             <div className="w-1 h-1 bg-accent rounded-full animate-pulse shadow-glow-sm" />
             <p className="text-[9px] font-black text-text uppercase tracking-widest">Insight Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
