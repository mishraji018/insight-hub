"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  LineChart, 
  Users, 
  Settings, 
  CreditCard,
  Code,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { SessionTimeout } from '@/components/SessionTimeout';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Logo } from '@/components/ui/Logo';
import { UserAvatar } from '@/components/dashboard/UserAvatar';
import { SearchModal } from '@/components/dashboard/SearchModal';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Search, Command } from 'lucide-react';

const sidebarLinks = [
  { href: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/analytics',       label: 'Analytics',       icon: LineChart       },
  { href: '/profile',         label: 'Profile Settings', icon: Settings       },
  { href: '/team',            label: 'Team Directory',  icon: Users           },
  { href: '/billing',         label: 'Billing & Usage', icon: CreditCard      },
  { href: '/developer',       label: 'Developer API',   icon: Code            },
  { href: '/admin/dashboard', label: 'Administration',  icon: Users, adminOnly: true },
];

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { children, userRole } = props as { children: React.ReactNode; userRole?: string };
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLabel = sidebarLinks.find(l => pathname.startsWith(l.href))?.label ?? 'Overview';

  useEffect(() => {
    if (mounted) {
      fetch('/api/track/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName: currentLabel }),
        keepalive: true,
      }).catch(() => {});
      
      // Close mobile menu on route change
      setShowMobileMenu(false);
    }
  }, [pathname, currentLabel, mounted]);

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
      <SessionTimeout />

      {/* ────────────── MOBILE OVERLAY ────────────── */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[40] md:hidden animate-in fade-in duration-300" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* ────────────── SIDEBAR (Responsive) ────────────── */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-surface2 bg-surface flex flex-col relative",
          "transition-all duration-500 ease-spring z-50 md:z-20",
          // Desktop behavior
          isCollapsed ? "md:w-[68px]" : "md:w-56",
          // Mobile drawer behavior
          "fixed top-0 bottom-0 left-0 -translate-x-full md:relative md:translate-x-0 shadow-2xl md:shadow-none",
          showMobileMenu && "translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-surface2 bg-surface">
          <Logo isCollapsed={isCollapsed} />
          <button 
            className="md:hidden p-2 text-muted hover:text-text rounded-xl"
            onClick={() => setShowMobileMenu(false)}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-2.5 space-y-1 grayscale-[0.3] hover:grayscale-0 transition-all duration-700">
          {sidebarLinks.map((link) => {
            if (link.adminOnly && userRole !== 'ADMIN') return null;

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center py-2.5 rounded-xl text-xs font-bold transition-all duration-500 group ripple",
                  isCollapsed ? "md:justify-center md:px-0" : "px-3 gap-3",
                  isActive
                    ? "bg-accent text-white shadow-glow-sm scale-[1.02]"
                    : "text-muted hover:text-text hover:bg-surface2"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 transition-transform duration-500",
                    isCollapsed ? "md:w-6 md:h-6" : "w-4 h-4",
                    isActive ? "scale-110 text-white" : "group-hover:scale-110"
                  )}
                />

                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-500",
                    isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-surface2">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              "flex items-center py-3 rounded-2xl text-sm font-black text-danger hover:bg-danger/10 transition-all duration-300 w-full group",
              isCollapsed ? "md:justify-center md:px-0" : "px-4 gap-4"
            )}
          >
            <LogOut className="flex-shrink-0 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-500",
                isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
              )}
            >
              Sign out
            </span>
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className={cn(
            "absolute -right-3.5 top-24 z-30 hidden md:flex",
            "w-8 h-8 rounded-full border border-surface2 bg-surface shadow-lg",
            "items-center justify-center text-muted hover:text-accent hover:border-accent/40 hover:shadow-glow-sm",
            "transition-all duration-500"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* ────────────── MAIN CONTENT ────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Header */}
        <header className="h-14 border-b border-surface2 bg-background/60 backdrop-blur-xl flex items-center justify-between px-5 z-10 transition-colors duration-300 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button 
              className="md:hidden p-2 bg-surface2 rounded-xl text-text hover:bg-surface2/80 transition-all"
              onClick={() => setShowMobileMenu(true)}
            >
              <LayoutDashboard className="w-6 h-6 text-accent" />
            </button>

            {/* Page title */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-text leading-tight tracking-tight">
                {currentLabel}
              </h1>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mt-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-accent" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger - Hidden on /dashboard */}
            {pathname !== '/dashboard' && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface2/50 border border-surface2 rounded-xl text-muted hover:text-accent hover:border-accent/30 transition-all group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Search...</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-background rounded-md border border-surface2 opacity-50">
                  <Command className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-black">K</span>
                </div>
              </button>
            )}

            <QuickActions />

            <div className="w-px h-6 bg-surface2 mx-1" />
            
            <NotificationBell />

            <div className="w-px h-6 bg-surface2 mx-1" />

            <UserAvatar />
          </div>
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 md:p-6 pb-28 md:pb-6">
          <div className="max-w-7xl mx-auto w-full page-enter">
            {children}
          </div>
        </div>

        {/* ────────────── MOBILE BOTTOM NAV ────────────── */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-3xl z-50 flex items-center justify-around px-4 shadow-2xl ring-1 ring-black/20">
           {sidebarLinks.slice(0, 4).map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "p-3 rounded-2xl transition-all duration-500 relative",
                  isActive ? "text-accent scale-110" : "text-muted hover:text-text"
                )}>
                   <Icon className="w-6 h-6" />
                   {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full animate-bounce-subtle" />}
                </Link>
              );
           })}
           <button 
             onClick={() => signOut({ callbackUrl: '/login' })}
             className="p-3 text-danger/70"
           >
              <LogOut className="w-6 h-6" />
           </button>
        </nav>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </main>
    </div>
  );
}
