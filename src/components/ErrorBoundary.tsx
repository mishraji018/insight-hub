import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full glass-card p-8 rounded-[2.5rem] border-none shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
            <div className="h-20 w-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black italic italic">Oops! Something <span className="text-destructive not-italic">broke</span>.</h1>
              <p className="text-muted-foreground text-sm font-medium">An unexpected error occurred. Don't worry, your data is safe.</p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 rounded-2xl bg-black/20 text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-destructive font-bold uppercase mb-2 tracking-widest">Error Details</p>
                <p className="text-[10px] font-mono text-white/60">{this.state.error?.message}</p>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
