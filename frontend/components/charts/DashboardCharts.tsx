"use client";

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
  ResponsiveContainer
} from 'recharts';

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
  { name: 'Reports', value: 300 },
  { name: 'Settings', value: 200 },
  { name: 'Export', value: 278 },
  { name: 'API', value: 189 },
];

const mockSessionData = [
  { time: '00:00', sessions: 120 },
  { time: '04:00', sessions: 80 },
  { time: '08:00', sessions: 450 },
  { time: '12:00', sessions: 600 },
  { time: '16:00', sessions: 550 },
  { time: '20:00', sessions: 300 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-surface2 p-3 rounded-lg shadow-xl">
        <p className="text-text font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardLineChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => \`\${val}\`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="logins" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DashboardBarChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockFeatureData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)' }} />
          <Bar dataKey="value" fill="var(--success)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DashboardAreaChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockSessionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent2)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent2)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="sessions" stroke="var(--accent2)" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
