import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md glass-card p-10 text-center border-destructive/20 scale-in-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-8 relative">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                    <div className="absolute inset-0 rounded-full border-2 border-destructive/20 animate-ping opacity-20" />
                </div>

                <h1 className="text-3xl font-black text-foreground mb-4 tracking-tighter italic uppercase">Security Violation</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-10 px-4">
                    You do not have the required clearance to access this sector.
                    Your attempt has been logged.
                </p>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold flex items-center justify-center gap-3 transition-all group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-all" />
                    Retreat to Dashboard
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
