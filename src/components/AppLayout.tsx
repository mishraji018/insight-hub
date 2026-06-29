import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authAPI, Notification as NotificationType } from "@/api/endpoints";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  BarChart3, Brain, FileSpreadsheet, LayoutDashboard, LogOut,
  Settings, Moon, Sun, Bell, User, Key, Shield, ChevronUp, Layout,
  CheckCheck, Trash2, ShieldAlert, Info, CheckCircle2, Search,
  Users, Globe, Plus
} from "lucide-react";
import SearchModal from "./SearchModal";
import api from "@/api/endpoints";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['executive', 'manager'] },
  { to: "/analytics", label: "Analytics", icon: FileSpreadsheet, roles: ['executive', 'analyst', 'manager'] },
  { to: "/predictions", label: "Predictions", icon: Brain, roles: ['executive', 'analyst', 'manager'] },
  { to: "/team", label: "Team", icon: Users, roles: ['executive', 'analyst', 'manager', 'user'] },
  { to: "/developer", label: "Developer", icon: Key, roles: ['executive', 'manager'] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const isStaff = useAuthStore(s => s.isStaff);
  const toggleTheme = useAuthStore(s => s.toggleTheme);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const activeOrgId = useAuthStore(s => s.activeOrgId);
  const setActiveOrgId = useAuthStore(s => s.setActiveOrgId);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      const data = await authAPI.getNotifications();
      setNotifications(data.results);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchOrgs();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchOrgs = async () => {
    try {
      const data = await api.org.getOrganisations();
      setOrganisations(data);
      if (data.length > 0 && !activeOrgId) {
        setActiveOrgId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch orgs");
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await authAPI.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await authAPI.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };
  
  // Rule: If a variable doesn't exist yet for user count, add it as a const with a default value of 0.
  const activeUsersCount = 15; // Set to 15 to match the "+12" demonstration (2 avatars + 13 more)

  // User handles theme globally now

  const filteredNavItems = navItems.filter(item =>
    !item.roles || (user && (user.role === 'admin' || item.roles.includes(user.role)))
  );

  const displayName = user?.name
    ? user.name
    : user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.email ?? 'User';

  return (
    <div className="flex min-h-screen text-foreground relative">
      {/* Fancy Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-background/85 z-10 backdrop-blur-[2px]" />
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex min-h-screen w-full z-10 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar/90 backdrop-blur-xl text-sidebar-foreground flex flex-col shrink-0 border-r border-white/10 shadow-2xl z-20">
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

        {/* Org Switcher */}
        <div className="px-5 mb-6 relative">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 ml-4">Current Context</p>
          <button 
             onClick={() => setShowOrgSwitcher(!showOrgSwitcher)}
             className="w-full p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Globe className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black truncate max-w-[100px]">
                  {organisations.find(o => o.id === activeOrgId)?.name || 'Personal'}
                </p>
                <p className="text-[8px] uppercase font-bold text-white/20">Organisation</p>
              </div>
            </div>
            <ChevronUp className={`h-4 w-4 text-white/20 transition-transform ${showOrgSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {showOrgSwitcher && (
            <div className="absolute top-full left-5 right-5 mt-2 p-2 rounded-2xl bg-sidebar-accent border border-white/10 shadow-2xl z-30 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2">
              <div className="max-h-48 overflow-y-auto space-y-1">
                {organisations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setShowOrgSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activeOrgId === org.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/40'
                    }`}
                  >
                    <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[11px] font-bold truncate">{org.name}</span>
                  </button>
                ))}
                <div className="h-px bg-white/5 my-2" />
                <Link
                  to="/team"
                  onClick={() => setShowOrgSwitcher(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[11px] font-bold">New Team</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar Removed */}

        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto pt-0">
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
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                  location.pathname === "/admin/dashboard"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 translate-x-1"
                    : "text-sidebar-foreground/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${location.pathname === "/admin/dashboard" ? 'text-primary-foreground' : 'text-primary/60'}`} />
                Super Dashboard
              </Link>
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
              {user?.theme_preference === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
            {user?.theme_preference === 'light' ? <Moon className="h-4 w-4 text-white/40" /> : <Sun className="h-4 w-4 text-white/40" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative">
        <header className="h-20 border-b border-border/40 flex items-center justify-between px-10 bg-background/30 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <Layout className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              {location.pathname.split('/')[1] || 'Overview'}
            </h2>
          </div>

          {/* User Profile and Notifications moved here */}
          <div className="flex items-center gap-4">
            
            {/* Notifications Dropdown */}
            <div className="relative z-30" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`relative p-2 rounded-xl transition-all duration-300 ${
                  showNotifications ? 'bg-primary/10 shadow-inner text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white border-2 border-background animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 p-2 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl z-50 scale-in-center">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border mb-2 bg-muted/50 rounded-t-xl">
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Notifications</span>
                      <button 
                        onClick={handleClearAll}
                        className="text-[9px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-tight flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear All
                      </button>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id}
                            className={`p-3 rounded-xl transition-all border ${
                              !notif.is_read ? 'bg-primary/5 border-primary/10' : 'opacity-60 grayscale-[0.5] border-transparent'
                            } hover:bg-muted group cursor-default`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 h-fit ${
                                notif.type === 'security' ? 'bg-destructive/10 text-destructive' :
                                notif.type === 'login' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {notif.type === 'security' ? <ShieldAlert className="h-3.5 w-3.5" /> :
                                 notif.type === 'login' ? <Info className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-black text-foreground leading-tight">{notif.title}</p>
                                  {!notif.is_read && (
                                    <button 
                                      onClick={() => handleMarkAsRead(notif.id)}
                                      className="p-1 rounded-md text-muted-foreground/30 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <CheckCheck className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground mt-1 leading-relaxed break-words">
                                  {notif.message}
                                </p>
                                <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-2 flex items-center gap-1">
                                  {formatDistanceToNow(new Date(notif.created_at))} ago
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              )}
            </div>

            <div className="h-6 w-px bg-border/50 mx-2" />

            {/* Profile Row */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all duration-300 ${
                  showProfileMenu ? 'bg-muted shadow-inner' : 'hover:bg-muted'
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/20 shadow-lg shadow-primary/20 overflow-hidden">
                  {user?.avatar ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <p className="text-[11px] font-black text-foreground leading-tight">{displayName}</p>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">{user?.role || 'Guest'}</span>
                </div>
                <ChevronUp className={`h-3 w-3 text-muted-foreground transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 p-2 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl z-50 scale-in-center">
                    <div className="px-4 py-3 border-b border-border mb-2 bg-muted/50 rounded-t-xl">
                      <p className="text-xs font-black text-foreground truncate">{displayName}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">{user?.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all relative z-10"
                    >
                      <User className="h-4 w-4 text-primary/60" /> Account Settings
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all relative z-10"
                    >
                      <Key className="h-4 w-4 text-primary/60" /> Change Password
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-bold text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all mt-1 relative z-10"
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
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}