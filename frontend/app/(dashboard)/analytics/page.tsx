"use client";

import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Filter } from 'lucide-react';

const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)'];

const mockDailyActivity = [
  { time: '00:00', value: 12 }, { time: '04:00', value: 45 },
  { time: '08:00', value: 156 }, { time: '12:00', value: 240 },
  { time: '16:00', value: 180 }, { time: '20:00', value: 89 }
];

const mockFeatures = [
  { name: 'Export', value: 45 }, { name: 'Report Generator', value: 34 },
  { name: 'API Sync', value: 28 }, { name: 'User Management', value: 15 }
];

const mockDevices = [
  { name: 'Desktop', value: 65 }, { name: 'Mobile', value: 25 },
  { name: 'Tablet', value: 10 }
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-surface border border-surface2 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-text">Platform Analytics</h2>
          <p className="text-sm text-muted">Detailed usage and performance metrics</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-surface2 hover:bg-surface2/80 text-text rounded-lg text-sm font-medium transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Last 30 Days
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-surface border border-surface2 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text mb-4">Daily Activity Pattern</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '8px' }} />
                <Line type="smooth" dataKey="value" stroke="var(--accent)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Used Features */}
        <div className="bg-surface border border-surface2 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Most Used Features</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFeatures} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} hide />
                <YAxis dataKey="name" type="category" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip cursor={{ fill: 'var(--surface2)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="var(--success)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-surface border border-surface2 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Device Breakdown</h3>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockDevices}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockDevices.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface2)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text">100%</span>
              <span className="text-xs text-muted">Total Traffic</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {mockDevices.map((device, index) => (
              <div key={device.name} className="flex items-center text-xs text-muted">
                <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index] }}></span>
                {device.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
