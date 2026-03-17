"use client";

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const mockActivityData = [
  { name: 'Mon', logins: 400 },
  { name: 'Tue', logins: 300 },
  { name: 'Wed', logins: 550 },
  { name: 'Thu', logins: 450 },
  { name: 'Fri', logins: 700 },
  { name: 'Sat', logins: 200 },
  { name: 'Sun', logins: 150 },
];

const mockFeatureData = [
  { name: 'Analytics', value: 400 },
  { name: 'Reports',   value: 300 },
  { name: 'Settings',  value: 200 },
  { name: 'Export',    value: 278 },
  { name: 'API',       value: 189 },
];

const mockSessionData = [
  { time: '00:00', sessions: 120 },
  { time: '04:00', sessions: 80  },
  { time: '08:00', sessions: 450 },
  { time: '12:00', sessions: 600 },
  { time: '16:00', sessions: 550 },
  { time: '20:00', sessions: 300 },
];

// Bar chart gradient colors cycling through accent palette
const BAR_COLORS = [
  'var(--accent)',
  'var(--accent2)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-surface2/60 px-3 py-2.5 rounded-xl shadow-card-hover backdrop-blur-sm">
        <p className="text-text font-semibold text-xs mb-1.5 uppercase tracking-wider opacity-60">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/** Wraps chart content with a fade+scale-in animation on mount */
function ChartWrapper({ children, delay = 0, className }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 origin-bottom",
        visible ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 translate-y-2",
        className
      )}
      style={{ transitionDelay: visible ? '0ms' : `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export const DashboardLineChart = ({ animationDelay = 0 }: { animationDelay?: number }) => {
  return (
    <ChartWrapper delay={animationDelay} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockActivityData} margin={{ top: 8, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="var(--accent2)" />
              <stop offset="100%" stopColor="var(--accent)"  />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="logins"
            stroke="url(#lineGlow)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--surface)' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent)' }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export const DashboardBarChart = ({ animationDelay = 0 }: { animationDelay?: number }) => {
  return (
    <ChartWrapper delay={animationDelay} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockFeatureData} margin={{ top: 8, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)', opacity: 0.6 }} />
          <Bar
            dataKey="value"
            radius={[5, 5, 0, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          >
            {mockFeatureData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export const DashboardAreaChart = ({ animationDelay = 0 }: { animationDelay?: number }) => {
  return (
    <ChartWrapper delay={animationDelay} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockSessionData} margin={{ top: 8, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent2)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--accent2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="strokeSessions" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="var(--accent)"  />
              <stop offset="100%" stopColor="var(--accent2)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="url(#strokeSessions)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSessions)"
            dot={{ r: 3.5, fill: 'var(--accent2)', strokeWidth: 2, stroke: 'var(--surface)' }}
            activeDot={{ r: 5.5, strokeWidth: 0. }}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
