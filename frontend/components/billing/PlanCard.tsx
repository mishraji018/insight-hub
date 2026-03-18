"use client";

import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  onUpgrade?: () => void;
}

export function PlanCard({ name, price, features, isCurrent, isPopular, onUpgrade }: PlanCardProps) {
  const isFree = name.toLowerCase() === 'free';
  const isEnterprise = name.toLowerCase() === 'enterprise';

  return (
    <div className={cn(
      "relative bg-surface border rounded-2xl p-6 flex flex-col transition-all duration-300 group hover:shadow-card-hover",
      isPopular ? "border-accent shadow-card ring-1 ring-accent/20 scale-[1.02]" : "border-surface2 hover:border-accent/40",
      isCurrent && "border-success shadow-success/10"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-glow flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-glow flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Current Plan
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-text capitalize mb-1">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-text">{price}</span>
          {price !== 'Custom' && price !== '$0' && <span className="text-sm text-muted">/mo</span>}
        </div>
      </div>

      <div className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 w-4 h-4 rounded-full bg-success/10 flex items-center justify-center text-success">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-sm text-muted group-hover:text-text transition-colors">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onUpgrade}
        disabled={isCurrent}
        className={cn(
          "w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
          isCurrent 
            ? "bg-surface2 text-muted cursor-default border border-surface2" 
            : isPopular 
              ? "bg-accent text-white hover:bg-accent/90 shadow-glow" 
              : "bg-surface2 text-text hover:bg-surface2/80 border border-surface2"
        )}
      >
        {isCurrent ? "Active" : isFree ? "Current Plan" : isEnterprise ? "Contact Sales" : "Upgrade Plan"}
        {!isCurrent && !isFree && <Zap className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
