"use client";

import { Users, Activity, UserPlus, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsStatsProps {
  stats: {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
    churnRate: string;
  };
  isLoading: boolean;
}

export function AnalyticsStats({ stats, isLoading }: AnalyticsStatsProps) {
  const cards = [
    { label: 'Total Users',  value: stats.totalUsers.toLocaleString(), icon: Users,      color: 'accent',  trend: '+2.5%' },
    { label: 'Active Today', value: stats.activeToday.toLocaleString(), icon: Activity,  color: 'success', trend: '+12.1%' },
    { label: 'New This Week',value: stats.newThisWeek.toLocaleString(), icon: UserPlus,  color: 'warning', trend: '+5.4%' },
    { label: 'Churn Rate',   value: stats.churnRate,                    icon: TrendingDown, color: 'danger',  trend: '-1.2%' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-surface border border-surface2 rounded-xl p-5 shadow-card hover:shadow-card-hover hover:border-accent/20 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2 rounded-lg text-muted transition-colors duration-300",
                card.color === 'accent'  && "group-hover:bg-accent/10 group-hover:text-accent",
                card.color === 'success' && "group-hover:bg-success/10 group-hover:text-success",
                card.color === 'warning' && "group-hover:bg-warning/10 group-hover:text-warning",
                card.color === 'danger'  && "group-hover:bg-danger/10 group-hover:text-danger",
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full gap-0.5",
                card.color === 'danger' ? "text-danger bg-danger/10" : "text-success bg-success/10"
              )}>
                {card.color === 'danger' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                {card.trend}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text mb-0.5">{isLoading ? '...' : card.value}</h3>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
