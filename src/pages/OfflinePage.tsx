import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfflinePage: React.FC = () => {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        const previousPath = sessionStorage.getItem('pre_offline_path');
        if (previousPath) {
          sessionStorage.removeItem('pre_offline_path');
          navigate(previousPath);
        } else {
          navigate('/dashboard');
        }
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  // Auto-restore when back online
  useEffect(() => {
    const handleOnline = () => {
      if (navigator.onLine) {
        const previousPath = sessionStorage.getItem('pre_offline_path');
        if (previousPath) {
          sessionStorage.removeItem('pre_offline_path');
          navigate(previousPath);
        } else {
          navigate('/dashboard');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 p-6 rounded-full bg-destructive/10">
        <WifiOff className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4 italic">
        You're <span className="text-destructive not-italic">Offline</span>
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We can't seem to connect to the Insight Hub servers. Please check your network connection and try again.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center justify-center gap-3 w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRetrying ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Try Again
              <RefreshCw className="h-5 w-5" />
            </>
          )}
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-3 w-full h-12 bg-white/5 border border-white/5 text-muted-foreground rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
        >
          <LayoutDashboard className="h-4 w-4" />
          View Cached Dashboard
        </button>
      </div>

      <div className="mt-12 p-3 px-6 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Auto-reconnecting every 30 seconds...
      </div>
    </div>
  );
};

export default OfflinePage;
