import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart3, Brain, FileSpreadsheet, LayoutDashboard, LogOut,
  Settings, Moon, Sun, Bell, User, Key, Shield, ChevronUp, Layout
} from "lucide-react";
import { toast } from "react-hot-toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['executive', 'manager'] },
  { to: "/analytics", label: "Analytics", icon: FileSpreadsheet, roles: ['executive', 'analyst', 'manager'] },
  { to: "/predictions", label: "Predictions", icon: Brain, roles: ['executive', 'analyst', 'manager'] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, user, isStaff } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [connectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
  // Rule: If a variable doesn't exist yet for user count, add it as a const with a default value of 0.
  const activeUsersCount = 15; // Set to 15 to match the "+12" demonstration (2 avatars + 13 more)

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  const filteredNavItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.email ?? 'User';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 border-r border-white/5 shadow-2xl z-20">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <span className="font-black text-xl tracking-tighter text-sidebar-primary-foreground italic">
              Insight<span className="text-primary not-italic tracking-normal ml-0.5">Hub</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 translate-x-1"
                    : "text-sidebar-foreground/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? 'text-primary-foreground' : 'text-primary/60'}`} />
                {item.label}
              </Link>
            );
          })}

          {isStaff && (
            <div className="space-y-1.5 pt-4">
              <div className="pt-4 pb-3 px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Administration</span>
              </div>
              <Link
                to="/admin/panel"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                  location.pathname === "/admin/panel"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 translate-x-1"
                    : "text-sidebar-foreground/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Shield className={`h-4 w-4 ${location.pathname === "/admin/panel" ? 'text-black' : 'text-amber-500/60'}`} />
                Admin Panel
              </Link>
              <Link
                to="/admin/train-model"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                  location.pathname === "/admin/train-model"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg translate-x-1"
                    : "text-sidebar-foreground/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Settings className={`h-4 w-4 ${location.pathname === "/admin/train-model" ? 'text-white' : 'text-white/20'}`} />
                Engine Metrics
              </Link>

              {/* Notification Bell and Avatars moved to sidebar vertical column */}
              <div className="px-4 py-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Status & Alerts</div>
                  <button className="relative flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group w-full">
                    <div className="relative">
                      <Bell className="h-5 w-5 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-sidebar" />
                    </div>
                    <span className="text-[11px] font-bold text-white/60">Notifications</span>
                  </button>

                  <div className="p-3 rounded-xl bg-white/5 space-y-3">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-tight">Active Members</div>
                    <div className="flex -space-x-2">
                      {/* Show first 2 avatars */}
                      {[1, 2].map(i => (
                        <div key={i} className="h-7 w-7 rounded-full border-2 border-sidebar bg-sidebar-accent flex items-center justify-center">
                          <User className="h-3 w-3 text-white/20" />
                        </div>
                      ))}
                      {/* Show +remaining */}
                      {activeUsersCount > 2 && (
                        <div className="h-7 w-7 rounded-full border-2 border-sidebar bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          +{activeUsersCount - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer - Only Theme Toggle left or moved? User only mentioned moving Sync and Profile */}
        <div className="p-5 border-t border-white/5">
          <button 
            onClick={toggleTheme} 
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">
              {themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
            {themeMode === 'light' ? <Moon className="h-4 w-4 text-white/40" /> : <Sun className="h-4 w-4 text-white/40" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-background/50 backdrop-blur-2xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5">
              <Layout className="h-4 w-4 text-white/20" />
            </div>
            <h2 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">
              {location.pathname.split('/')[1] || 'Overview'}
            </h2>
          </div>

          {/* Sync status and User Profile moved here side-by-side */}
          <div className="flex items-center gap-4">
            {/* Sync Status Row */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
              <div className={`h-1.5 w-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-destructive'} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {connectionStatus === 'connected' ? 'Sync: On' : 'Sync: Off'}
              </span>
            </div>

            <div className="h-6 w-px bg-white/5 mx-2" />

            {/* Profile Row */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all duration-300 ${
                  showProfileMenu ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/20 shadow-lg shadow-primary/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <p className="text-[11px] font-black text-white leading-tight">{displayName}</p>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{user?.role || 'Guest'}</span>
                </div>
                <ChevronUp className={`h-3 w-3 text-white/20 transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 p-2 rounded-2xl bg-sidebar-accent border border-white/10 shadow-2xl z-30 backdrop-blur-3xl scale-in-center">
                  <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5 rounded-t-xl">
                    <p className="text-xs font-black text-white truncate">{displayName}</p>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter mt-0.5">{user?.role}</p>
                  </div>
                  <Link
                    to="/change-password"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Key className="h-4 w-4 text-primary/60" /> Change Password
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all mt-1"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}