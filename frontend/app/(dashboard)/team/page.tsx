import { Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 border-b border-surface2">
        <div>
          <h1 className="text-2xl font-bold text-text">Team Directory</h1>
          <p className="text-sm text-muted">Manage your organization members and roles</p>
        </div>
      </div>
      
      <div className="bg-surface border border-surface2 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Coming Soon</h2>
        <p className="text-muted max-w-md">
          Team management features are currently under development. Soon you'll be able to invite teammates and assign roles.
        </p>
      </div>
    </div>
  );
}
