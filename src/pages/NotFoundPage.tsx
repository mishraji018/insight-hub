import { Link } from "react-router-dom";
import { MoveLeft, HelpCircle } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 overflow-hidden">
            <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="relative inline-block">
                        <h1 className="text-[150px] font-black italic leading-none tracking-tighter text-white opacity-5">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-20 w-20 bg-primary/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
                                <HelpCircle className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-black italic">Page <span className="text-primary not-italic">Lost</span> in Orbit</h2>
                        <p className="text-muted-foreground text-sm font-medium px-4">The route you are looking for doesn't exist or has been moved to another coordinate.</p>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Link 
                            to="/dashboard" 
                            className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <MoveLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <Link 
                            to="/login" 
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                            Sign In to another account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
