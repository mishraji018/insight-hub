import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className={cn("absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse", sizeClasses[size])} />
        <Loader2 className={cn("text-accent animate-spin-slow", sizeClasses[size])} />
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-black text-accent uppercase tracking-widest animate-pulse">Syncing Insights...</p>
    </div>
  );
}
