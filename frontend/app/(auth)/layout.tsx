"use client";

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('cherry');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app-theme') || 'cherry';
    setTheme(saved);
    
    const handleStorage = () => setTheme(localStorage.getItem('app-theme') || 'cherry');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-700">
      
      {/* 🌸 CHERRY BLOSSOM: Falling Petals */}
      {theme === 'cherry' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="petal"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 10}s`,
                animationDelay: `${-Math.random() * 10}s`,
                width: `${10 + Math.random() * 10}px`,
                height: `${10 + Math.random() * 10}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* 🌑 DARK / 🌊 OCEAN / 👑 ROYAL: Twinkling Stars */}
      {(theme === 'dark' || theme === 'ocean' || theme === 'royal') && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
                opacity: Math.random(),
                animationDuration: `${2 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 🌅 SUNSET / 🌿 FOREST: Glowing Particles */}
      {(theme === 'sunset' || theme === 'forest') && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-accent/20 blur-xl rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                animation: `bounce-subtle ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${-Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ────────────── 3D CELESTIAL OBJECT ────────────── */}
      <div className="mb-12 relative z-10 flex flex-col items-center">
        {theme === 'dark' ? (
          <div className="relative">
            <Moon className="w-24 h-24 text-accent animate-moon-float" />
            <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-accent2 animate-pulse" />
            <div className="absolute top-10 -left-10 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_15px_var(--accent)]" />
          </div>
        ) : theme === 'cherry' || theme === 'sunset' ? (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full animate-sun-pulse shadow-[0_0_60px_rgba(251,191,36,0.5)]" />
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute top-1/2 left-1/2 w-32 h-1 bg-yellow-400/40 rounded-full origin-left -translate-y-1/2"
                style={{ transform: `rotate(${i * 45}deg) translateX(12px)`, animation: 'sun-rotate 10s linear infinite' }}
              />
            ))}
          </div>
        ) : theme === 'ocean' ? (
          <div className="relative">
             <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-bounce-subtle shadow-[0_0_50px_rgba(34,211,238,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-2 translate-x-3 scale-110 blur-md rounded-full" />
             </div>
             <Sparkles className="absolute -bottom-2 -left-4 w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
        ) : theme === 'forest' ? (
          <div className="relative">
             <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-700 rounded-full animate-sun-pulse border-4 border-emerald-300/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             </div>
             <Sparkles className="absolute top-0 -right-2 w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
        ) : (
          <div className="relative">
             <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-700 rounded-full animate-bounce-subtle shadow-[0_0_40px_rgba(109,40,217,0.4)]">
                <div className="absolute inset-0 bg-white/10 blur-sm rounded-full translate-x-2 translate-y-2 opacity-50" />
             </div>
             <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-purple-300 animate-pulse" />
          </div>
        )}
      </div>

      {/* ────────────── AUTH CARD ────────────── */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-surface2 rounded-3xl shadow-2xl p-8 relative z-20 overflow-hidden">
          <div className="flex justify-center mb-8">
            <Logo className="scale-125" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
