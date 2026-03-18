"use client";

import { useState, useEffect, useRef } from 'react';
import { Palette, Type, Check, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export const THEMES = [
  { id: 'cherry',  name: 'Cherry Blossom', color: '#ec4899' },
  { id: 'dark',    name: 'Dark Mode',      color: '#00ff88' },
  { id: 'ocean',   name: 'Ocean Blue',     color: '#0369a1' },
  { id: 'sunset',  name: 'Sunset Orange',  color: '#ea580c' },
  { id: 'forest',  name: 'Forest Green',   color: '#166534' },
  { id: 'royal',   name: 'Royal Purple',   color: '#6d28d9' },
];

export const FONTS = [
  { id: 'Inter', name: 'Default', family: "'Inter', sans-serif" },
  { id: 'Dancing Script', name: 'Cursive', family: "'Dancing Script', cursive" },
  { id: 'Playfair Display', name: 'Elegant', family: "'Playfair Display', serif" },
  { id: 'Oswald', name: 'Bold', family: "'Oswald', sans-serif" },
  { id: 'JetBrains Mono', name: 'Mono', family: "'JetBrains Mono', monospace" },
  { id: 'Nunito', name: 'Rounded', family: "'Nunito', sans-serif" },
  { id: 'Merriweather', name: 'Classic', family: "'Merriweather', serif" },
  { id: 'Raleway', name: 'Modern', family: "'Raleway', sans-serif" },
  { id: 'Cinzel', name: 'Fancy', family: "'Cinzel', serif" },
  { id: 'Caveat', name: 'Handwritten', family: "'Caveat', cursive" },
];

interface ThemeFontPickerProps {
  currentTheme: string;
  currentFont: string;
  onThemeChange: (id: string) => void;
  onFontChange: (id: string) => void;
  inline?: boolean;
}

export function ThemeFontPicker({ 
  currentTheme, 
  currentFont, 
  onThemeChange, 
  onFontChange,
  inline = false 
}: ThemeFontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'fonts'>('themes');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const toggleTheme = (id: string) => {
    onThemeChange(id);
    document.documentElement.setAttribute('data-theme', id);
    if (id === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('app-theme', id);
  };

  const toggleFont = (id: string) => {
    const font = FONTS.find(f => f.id === id);
    if (font) {
      onFontChange(id);
      document.documentElement.style.setProperty('--app-font', font.id);
      localStorage.setItem('selectedFont', font.id);
      localStorage.setItem('app-font-id', id);
    }
  };

  const TriggerButton = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      title={`${THEMES.find(t => t.id === currentTheme)?.name} + ${currentFont}`}
      className={cn(
        "flex items-center justify-center w-12 h-12 bg-surface border-2 border-surface2 hover:border-accent hover:shadow-glow-sm rounded-2xl transition-all group",
        isOpen && "border-accent ring-4 ring-accent/10"
      )}
    >
      <div className="relative flex items-center justify-center">
        <div 
          className="w-6 h-6 rounded-full border-2 border-surface shadow-sm" 
          style={{ backgroundColor: THEMES.find(t => t.id === currentTheme)?.color || '#ec4899' }} 
        />
        <div className="absolute -right-1.5 -bottom-1.5 w-6 h-6 bg-surface border border-surface2 rounded-lg flex items-center justify-center text-[10px] font-black text-text shadow-sm group-hover:scale-110 transition-transform">
          T
        </div>
      </div>
    </button>
  );

  return (
    <div className="relative">
      {!inline && TriggerButton}
      
      {isOpen && (
        <div className={cn(
          "fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300",
          inline && "absolute inset-0 z-50 rounded-xl"
        )}>
          <div 
            ref={modalRef}
            className="w-full max-w-md bg-surface border border-surface2 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-text tracking-tight">Style Preferences</h3>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5 opacity-60">Personalize your Workspace</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:text-text hover:bg-surface2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('themes')}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activeTab === 'themes' ? "bg-accent text-white shadow-glow-sm" : "bg-surface2/50 text-muted hover:bg-surface2"
                )}
              >
                <Palette className="w-4 h-4" /> Themes
              </button>
              <button
                onClick={() => setActiveTab('fonts')}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activeTab === 'fonts' ? "bg-accent text-white shadow-glow-sm" : "bg-surface2/50 text-muted hover:bg-surface2"
                )}
              >
                <Type className="w-4 h-4" /> Fonts
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 pb-6 flex-1 overflow-y-auto max-h-[50vh] thin-scrollbar">
              {activeTab === 'themes' ? (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-left-4 duration-500">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => toggleTheme(theme.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl transition-all group border-2 relative",
                        currentTheme === theme.id ? "bg-accent/10 border-accent/20" : "bg-surface2/20 border-transparent hover:border-surface2"
                      )}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl shadow-md border-2 border-white/10 transition-transform group-hover:scale-110 flex-shrink-0 flex items-center justify-center" 
                        style={{ backgroundColor: theme.color }}
                      >
                        {currentTheme === theme.id && <Check className="w-5 h-5 text-white" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider text-left leading-tight",
                        currentTheme === theme.id ? "text-accent" : "text-muted"
                      )}>
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-500">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => toggleFont(font.id)}
                      className={cn(
                        "p-3 rounded-2xl transition-all flex flex-col gap-2 border-2 group relative text-left",
                        currentFont === font.id ? "bg-accent/10 border-accent/20" : "bg-surface2/20 border-transparent hover:border-surface2"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate opacity-60">
                          {font.name}
                        </span>
                        {currentFont === font.id && (
                          <Check className="w-3 h-3 text-accent" />
                        )}
                      </div>
                      <p style={{ fontFamily: font.family }} className="text-xl text-text leading-none py-1">
                        Aa
                      </p>
                      <p className="text-[10px] font-bold text-text/70 truncate">{font.id}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface2/30 border-t border-surface2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-surface text-text text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 border-surface2 hover:bg-surface2 transition-all shadow-sm"
              >
                Close & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
