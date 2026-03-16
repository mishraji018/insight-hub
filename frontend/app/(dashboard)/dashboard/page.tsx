import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardAreaChart 
} from '@/components/charts/DashboardCharts';
import { Users, Activity, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logins', value: '12,450', icon: Users, trend: '+12.5%', isUp: true },
          { label: 'Days Active', value: '342', icon: Activity, trend: '+2.1%', isUp: true },
          { label: 'Features Used', value: '45', icon: MousePointerClick, trend: '-4.3%', isUp: false },
          { label: 'Avg. Session', value: '24m', icon: Clock, trend: '+8.2%', isUp: true },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-surface2 rounded-lg text-muted">
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.isUp ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                  {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-text mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-muted">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface2 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text">Login Activity</h3>
            <p className="text-sm text-muted">Weekly login trends across all users</p>
          </div>
          <DashboardLineChart />
        </div>

        <div className="bg-surface border border-surface2 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text">Top Features</h3>
            <p className="text-sm text-muted">Most utilized features this week</p>
          </div>
          <DashboardBarChart />
        </div>

        <div className="bg-surface border border-surface2 rounded-xl p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text">Active Sessions</h3>
            <p className="text-sm text-muted">Concurrent active sessions over time</p>
          </div>
          <DashboardAreaChart />
        </div>
      </div>

    </div>
  );
}
