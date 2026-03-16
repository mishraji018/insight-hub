"use client";

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
  Bell
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/profile', label: 'Profile Settings', icon: Settings },
  { href: '/team', label: 'Team Directory', icon: Users },
  { href: '/billing', label: 'Billing & Usage', icon: CreditCard },
  { href: '/developer', label: 'Developer API', icon: Code },
  { href: '/admin/dashboard', label: 'Administration', icon: Users, adminOnly: true },
];

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const { children, userRole } = props as { children: React.ReactNode; userRole?: string };
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-surface2 bg-surface hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-surface2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xs">IH</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-text">Insight Hub</span>
        </div>

        <nav className="flex-1 overflow-y-auto w-full py-6 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            if (link.adminOnly && userRole !== 'ADMIN') return null;
            
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-muted hover:text-text hover:bg-surface2"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-accent" : "text-muted group-hover:text-text")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface2">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-surface2 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            {/* Mobile menu toggle would go here */}
            <h1 className="text-lg font-semibold text-text hidden sm:block">
              {sidebarLinks.find(l => pathname.startsWith(l.href))?.label || "Overview"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-surface2 transition-colors text-muted hover:text-text">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-background"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
              U
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
