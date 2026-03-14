import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Hourglass, LogOut, RefreshCw, Mail } from "lucide-react";
import toast from "react-hot-toast";

const PendingApprovalPage = () => {
    const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const initializeAuth = useAuthStore(s => s.initializeAuth);
  const isApproved = useAuthStore(s => s.isApproved);
    const navigate = useNavigate();

    useEffect(() => {
        // If approved while on this page, redirect
        if (isApproved) {
            toast.success("Your account has been approved! Welcome.");
            navigate("/dashboard");
        }
    }, [isApproved, navigate]);

    useEffect(() => {
        // Auto refresh every 30 seconds
        const interval = setInterval(() => {
            initializeAuth();
        }, 30000);

        return () => clearInterval(interval);
    }, [initializeAuth]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="glass-card p-10 text-center border-amber-500/20 shadow-2xl animate-in zoom-in-95 duration-500 transition-all">
                    <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-8 relative">
                        <Hourglass className="h-10 w-10 text-amber-500 animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">Pending Approval</h1>

                    <div className="space-y-4 mb-10">
                        <p className="text-muted-foreground text-sm leading-relaxed px-4">
                            Your account is currently being reviewed by an administrator.
                            You will be automatically granted access once a role is assigned.
                        </p>

                        <div className="p-3 rounded-lg bg-white/5 border border-white/5 inline-flex items-center gap-2 mx-auto">
                            <Mail className="h-3.5 w-3.5 text-white/30" />
                            <span className="text-xs font-medium text-white/60">{user?.email}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                initializeAuth();
                                toast.success("Checking status...");
                            }}
                            className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold flex items-center justify-center gap-2 transition-all group"
                        >
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            Refresh Status
                        </button>

                        <button
                            onClick={logout}
                            className="w-full h-12 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>

                    <div className="mt-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 animate-pulse">
                            System checking for updates...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalPage;
