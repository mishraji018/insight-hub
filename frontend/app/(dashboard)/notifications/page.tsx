"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  Shield, 
  Info, 
  AlertTriangle,
  ArrowLeft,
  Filter,
  MoreVertical,
  Check,
  Calendar,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/Loading";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SECURITY" | "SYSTEM" | "INFO" | "WARNING";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("All caught up!");
      }
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification removed");
      }
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const markOneRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to update notification");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SECURITY": return (
        <div className="p-2.5 bg-danger/10 text-danger rounded-xl">
          <Shield className="w-5 h-5 shadow-glow-sm" />
        </div>
      );
      case "WARNING": return (
        <div className="p-2.5 bg-warning/10 text-warning rounded-xl">
          <AlertTriangle className="w-5 h-5 shadow-glow-sm" />
        </div>
      );
      case "SYSTEM": return (
        <div className="p-2.5 bg-success/10 text-success rounded-xl">
          <CheckCircle2 className="w-5 h-5 shadow-glow-sm" />
        </div>
      );
      default: return (
        <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
          <Info className="w-5 h-5 shadow-glow-sm" />
        </div>
      );
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.isRead;
    return n.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent" />
            Notifications
          </h1>
          <p className="text-muted text-xs font-bold mt-1 uppercase tracking-widest opacity-80">
            Keep track of system alerts and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead}
            className="px-4 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border border-accent/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Clear All New
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {["ALL", "UNREAD", "SECURITY", "SYSTEM", "WARNING"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border capitalize",
              filter === f 
                ? "bg-accent text-white border-accent shadow-glow-sm" 
                : "bg-surface text-muted border-surface2 hover:border-accent/40"
            )}
          >
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface border border-surface2 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="grid gap-3">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-5 transition-all group flex items-start gap-4 rounded-2xl border relative overflow-hidden",
                  !n.isRead 
                    ? "bg-accent/5 border-accent/20 shadow-glow-sm" 
                    : "bg-surface border-surface2/50 hover:border-accent/30 hover:bg-surface2/10 shadow-sm"
                )}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50" />
                )}
                
                {getTypeIcon(n.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={cn("text-sm font-black tracking-tight", !n.isRead ? "text-accent" : "text-text")}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted uppercase">
                      <Clock className="w-3 h-3" />
                      {format(new Date(n.createdAt), 'MMM dd, p')}
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed font-medium max-w-2xl">{n.message}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {!n.isRead && (
                        <button 
                          onClick={() => markOneRead(n.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                          <Check className="w-2.5 h-2.5" />
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-surface2 hover:bg-danger/10 text-muted hover:text-danger text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        Remove
                      </button>
                    </div>
                    
                    <span className="text-[8px] font-black text-muted/30 uppercase tracking-tighter group-hover:text-muted/60">
                      ID: {n.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-surface2 rounded-lg transition-all absolute top-4 right-4 text-muted">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={filter === "ALL" ? "No notifications yet" : `No ${filter.toLowerCase()} alerts`}
            description={filter === "ALL" 
              ? "We'll notify you when something important happens on your account." 
              : `You don't have any notifications under this category.`}
            icon={Bell}
            className="bg-transparent border-none py-24"
            action={filter !== "ALL" ? {
              label: "Clear Filters",
              onClick: () => setFilter("ALL")
            } : undefined}
          />
        )}
      </div>

      <div className="pt-8 border-t border-surface2">
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-surface2 hover:bg-surface2/80 text-text text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-surface2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
