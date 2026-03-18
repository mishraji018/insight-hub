"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Guest';
  const [progress, setProgress] = useState(100);
  const [showPawan, setShowPawan] = useState(false);

  useEffect(() => {
    // Word by word animation logic
    const timer = setTimeout(() => setShowPawan(true), 1000);
    
    // Progress bar countdown
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / 50))); // 5 seconds = 50 intervals of 100ms
    }, 100);

    // Auto redirect
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 🌸 falling items animation container */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            {['🌸', '🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes word-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-word {
          animation: word-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="relative z-10 text-center space-y-8 max-w-2xl w-full">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 animate-in fade-in zoom-in duration-1000">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Success Verification</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter flex items-center justify-center gap-4 flex-wrap">
            <span className="animate-word">Welcome</span>
            {showPawan && (
              <span className="animate-word text-accent drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]">
                {name}!
              </span>
            )}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1500 fill-mode-forwards opacity-0" style={{ animationDelay: '2s' }}>
            Great to have you back
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-1000" style={{ animationDelay: '2.5s' }}>
          <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Redirecting to dashboard in {Math.ceil(progress / 20)} seconds...</p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-text text-background font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000"
          style={{ animationDelay: '3s' }}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
