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
import { signOut } from 'next-auth/react';

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
  const { children, userRole } = props as { children: React.ReactNode; userRole?: string };
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const resolved = saved ?? 'dark';
    setTheme(resolved);
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const currentLabel = sidebarLinks.find(l => pathname.startsWith(l.href))?.label ?? 'Overview';

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">

      {/* ────────────── SIDEBAR ────────────── */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-surface2 bg-surface hidden md:flex flex-col relative",
          "transition-all duration-300 ease-spring z-20",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface2">
          <div className="flex items-center min-w-0 gap-3">
            {/* Logo icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {/* Brand name — hidden when collapsed */}
            <span
              className={cn(
                "font-bold text-base tracking-tight text-text whitespace-nowrap overflow-hidden transition-all duration-300",
                isCollapsed ? "w-0 opacity-0" : "w-36 opacity-100"
              )}
            >
              Insight Hub
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-5 px-2 space-y-1">
          {sidebarLinks.map((link) => {
            if (link.adminOnly && userRole !== 'ADMIN') return null;

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "relative flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                  isCollapsed ? "justify-center px-2" : "px-3 gap-3",
                  isActive
                    ? "bg-accent/10 text-accent shadow-glow-sm/50"
                    : "text-muted hover:text-text hover:bg-surface2"
                )}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}

                <Icon
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5",
                    isActive ? "text-accent" : "text-muted group-hover:text-text"
                  )}
                />

                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-surface2">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex items-center py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors duration-300 w-full",
              isCollapsed ? "justify-center px-2" : "px-3 gap-3"
            )}
          >
            <LogOut className="flex-shrink-0 w-4.5 h-4.5" />
            <span
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-300",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              Sign out
            </span>
          </button>
        </div>

        {/* Collapse/Expand toggle button — floats on the right edge */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute -right-3.5 top-20 z-30",
            "w-7 h-7 rounded-full border border-surface2 bg-surface shadow-card",
            "flex items-center justify-center text-muted hover:text-text hover:border-accent/40 hover:shadow-glow-sm",
            "transition-all duration-300"
          )}
        >
          {isCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* ────────────── MAIN CONTENT ────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Header */}
        <header className="h-16 border-b border-surface2 bg-background/80 backdrop-blur-md flex items-center justify-between px-5 z-10 transition-colors duration-300 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Page title */}
            <div>
              <h1 className="text-base font-semibold text-text leading-tight sm:block hidden">
                {currentLabel}
              </h1>
              <p className="text-xs text-muted hidden sm:block leading-none mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1.5">

            {/* Dark/Light toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden",
                  "text-muted hover:text-text hover:bg-surface2 transition-all duration-300",
                  "focus-ring"
                )}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <Sun
                  className={cn(
                    "w-4.5 h-4.5 absolute transition-all duration-300",
                    theme === 'dark'
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 rotate-90 scale-75"
                  )}
                />
                <Moon
                  className={cn(
                    "w-4.5 h-4.5 absolute transition-all duration-300",
                    theme === 'light'
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-75"
                  )}
                />
              </button>
            )}

            {/* Notifications */}
            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-text hover:bg-surface2 transition-colors focus-ring"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full border border-background" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-surface2 mx-1" />

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-bold text-sm shadow-glow-sm select-none">
              U
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-6">
          <div className="max-w-7xl mx-auto w-full page-enter">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}
