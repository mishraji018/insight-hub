"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { AlertCircle, LogOut, Clock } from "lucide-react";
import toast from "react-hot-toast";

const WARNING_MS = 25 * 60 * 1000; // 25 minutes
const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function SessionTimeout() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (!session) return;

    let warningTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);
      setShowWarning(false);

      warningTimer = setTimeout(() => setShowWarning(true), WARNING_MS);
      timeoutTimer = setTimeout(logout, TIMEOUT_MS);
    };

    // Events to track activity
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      // If warning is already shown, don't reset until user clicks "Stay Logged In"
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);
    };
  }, [session, logout, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface border border-surface2 rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-warning">
          <Clock className="w-6 h-6" />
          <h2 className="text-lg font-bold">Session Expiring Soon</h2>
        </div>
        
        <p className="text-sm text-muted leading-relaxed">
          Your session will expire in 5 minutes due to inactivity. Would you like to stay logged in?
        </p>

        <div className="flex gap-3">
          <button 
            onClick={() => {
              setShowWarning(false);
              // resetTimers will trigger on next activity
            }}
            className="flex-1 bg-accent hover:bg-accent/90 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-glow-sm"
          >
            Stay Logged In
          </button>
          <button 
            onClick={logout}
            className="flex-1 bg-surface2 hover:bg-surface2/80 text-text py-2 rounded-xl text-sm font-bold border border-surface2 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
