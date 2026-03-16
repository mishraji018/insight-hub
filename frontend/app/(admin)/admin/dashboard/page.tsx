"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Shield, ShieldAlert, UserPlus, Lock } from 'lucide-react';
import DashboardLayout from '../../../(dashboard)/layout';

const growthData = [
  { month: 'Jan', users: 120 }, { month: 'Feb', users: 180 }, 
  { month: 'Mar', users: 250 }, { month: 'Apr', users: 310 },
  { month: 'May', users: 450 }, { month: 'Jun', users: 520 },
  { month: 'Jul', users: 680 }, { month: 'Aug', users: 850 },
  { month: 'Sep', users: 950 }, { month: 'Oct', users: 1100 },
  { month: 'Nov', users: 1300 }, { month: 'Dec', users: 1540 }
];

const failedLogins = [
  { day: 'Mon', attempts: 12 }, { day: 'Tue', attempts: 8 },
  { day: 'Wed', attempts: 45 }, { day: 'Thu', attempts: 15 },
  { day: 'Fri', attempts: 9 }, { day: 'Sat', attempts: 4 },
  { day: 'Sun', attempts: 6 }
];

export default function AdminDashboardPage() {
  return (
    // @ts-expect-error NextJS strict layout types do not allow custom props
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between pb-4 border-b border-surface2">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center">
              <Shield className="w-6 h-6 mr-3 text-accent" />
              Admin Control Center
            </h1>
            <p className="text-muted text-sm mt-1">Platform-wide overview and security metrics</p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '1,540', icon: UserPlus, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Active Today', value: '892', icon: Shield, color: 'text-success', bg: 'bg-success/10' },
            { label: 'New This Week', value: '45', icon: UserPlus, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Locked Accounts', value: '12', icon: Lock, color: 'text-danger', bg: 'bg-danger/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-surface border border-surface2 rounded-xl p-5 relative overflow-hidden group">
                <div className={"absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 transition-transform group-hover:scale-110 " + stat.bg} />
                <div className={"p-3 rounded-lg inline-flex mb-4 " + stat.bg + " " + stat.color}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-bold text-text mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-muted">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-surface border border-surface2 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text mb-4">User Growth (12 Months)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '8px' }} />
                  <Line type="basis" dataKey="users" stroke="var(--accent)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-surface2 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Failed Logins</h3>
              <ShieldAlert className="w-5 h-5 text-danger" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failedLogins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--surface2)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '8px' }} />
                  <Bar dataKey="attempts" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
