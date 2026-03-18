"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Shield, Info, AlertTriangle, Check, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SECURITY" | "WARNING" | "SYSTEM" | "INFO";
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("Marked all as read");
      }
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    setIsDeleting(id);
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
        if (res.ok) {
          setNotifications(prev => prev.filter(n => n.id !== id));
          toast.success("Notification removed");
        }
      } catch (err) {
        toast.error("Failed to delete notification");
      } finally {
        setIsDeleting(null);
      }
    }, 300);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SECURITY": return <Shield className="w-4 h-4 text-danger" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "SYSTEM": return <CheckCircle2 className="w-4 h-4 text-success" />;
      default: return <Info className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ripple-btn",
          isOpen ? "bg-accent/10 text-accent" : "text-muted hover:text-text hover:bg-surface2"
        )}
      >
        <Bell className={cn("w-5 h-5 transition-transform", isOpen && "rotate-12")} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[16px] h-[16px] px-1 bg-accent text-white text-[9px] font-black rounded-full border-2 border-surface flex items-center justify-center animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-3 w-80 max-h-[480px] bg-surface/95 backdrop-blur-xl border border-surface2 rounded-2xl shadow-premium z-50 overflow-hidden",
          "animate-in fade-in slide-in-from-top-2 duration-200"
        )}>
          <div className="p-4 border-b border-surface2 flex items-center justify-between bg-surface2/30">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-text uppercase tracking-widest">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-lg bg-accent/20 text-accent text-[9px] font-black tracking-tight border border-accent/20">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[9px] font-black text-accent hover:text-accent/80 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                Read All
              </button>
            )}
          </div>

          <div className="overflow-y-auto no-scrollbar max-h-[380px]">
            {notifications.length > 0 ? (
              <div className="divide-y divide-surface2/50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 hover:bg-surface2/40 transition-all cursor-pointer group relative",
                      !n.isRead && "bg-accent/5",
                      isDeleting === n.id && "opacity-0 -translate-x-full duration-300"
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-lg" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">{getTypeIcon(n.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-[11px] font-black truncate uppercase tracking-tight", n.isRead ? "text-text" : "text-accent")}>
                            {n.title}
                          </p>
                          <span className="text-[9px] font-bold text-muted whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              <Check className="w-2.5 h-2.5" />
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="text-[9px] font-black text-danger/70 uppercase tracking-widest flex items-center gap-1 hover:text-danger"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-surface2 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-muted/40" />
                </div>
                <p className="text-[11px] font-black text-text uppercase tracking-widest">All caught up! 🎉</p>
                <p className="text-[10px] text-muted font-medium mt-1">No new notifications to show.</p>
              </div>
            )}
          </div>

          <Link 
            href="/notifications" 
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent hover:bg-surface2/50 border-t border-surface2 transition-all"
          >
            View all history
          </Link>
        </div>
      )}
    </div>
  );
}
