"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Mail,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UserAvatar() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Listen for custom event to refresh avatar if needed
    const handleProfileUpdate = () => fetchUserData();
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.firstName?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U";
  const fullName = user ? `${user.firstName} ${user.lastName}` : (session?.user?.name || "User");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1 rounded-2xl transition-all duration-300",
          "hover:bg-surface2 group",
          isOpen && "bg-surface2"
        )}
      >
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-black text-sm shadow-glow-sm overflow-hidden border-2 border-white/20 select-none">
          {user?.avatar ? (
            <Image 
              src={user.avatar} 
              alt="Avatar" 
              fill 
              className="object-cover" 
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted transition-transform duration-300 group-hover:text-accent",
          isOpen && "rotate-180 text-accent"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-surface border border-surface2 rounded-3xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-4 mb-2 border-b border-surface2">
            <p className="text-sm font-black text-text truncate">{fullName}</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest truncate mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {session?.user?.email}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-muted hover:text-accent hover:bg-accent/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-surface2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                <User className="w-4 h-4" />
              </div>
              View Profile
            </Link>
            
            <Link
              href="/profile?tab=settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-muted hover:text-accent hover:bg-accent/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-surface2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              Preferences
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-muted hover:text-accent hover:bg-accent/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                Admin Panel
              </Link>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-surface2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-black text-danger hover:bg-danger/5 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-danger/5 group-hover:bg-danger/10 flex items-center justify-center transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
