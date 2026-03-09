import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Brain, FileSpreadsheet, LayoutDashboard, LogOut, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: FileSpreadsheet },
  { to: "/predictions", label: "Predictions", icon: Brain },
];

const adminItems = [
  { to: "/admin/train-model", label: "Train Model", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, isAdmin, user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-sidebar-primary" />
            <span className="font-bold text-lg text-sidebar-primary-foreground">SalesIQ</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">Admin</span>
              </div>
              {adminItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email || "user@example.com"}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
