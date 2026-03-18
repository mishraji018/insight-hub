import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
}

export function Logo({ className, isCollapsed }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/40 blur-lg rounded-lg group-hover:bg-accent/60 transition-all duration-500" />
        
        {/* Logo box */}
        <div className="relative w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-xl flex items-center justify-center shadow-glow-sm border border-white/10 group-hover:scale-105 transition-transform duration-500">
          <span className="text-white font-black text-xl tracking-tighter italic">IH</span>
        </div>
        
        {/* Sparkle decorative element */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center animate-bounce-subtle shadow-lg">
          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
        </div>
      </div>

      {!isCollapsed && (
        <span className="font-black text-xl tracking-tight text-text whitespace-nowrap overflow-hidden transition-all duration-500 group-hover:tracking-normal">
          Insight<span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">Hub</span>
        </span>
      )}
    </div>
  );
}
