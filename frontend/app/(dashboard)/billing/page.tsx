import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 border-b border-surface2">
        <div>
          <h1 className="text-2xl font-bold text-text">Billing & Usage</h1>
          <p className="text-sm text-muted">Manage your subscription and view usage statistics</p>
        </div>
      </div>
      
      <div className="bg-surface border border-surface2 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Coming Soon</h2>
        <p className="text-muted max-w-md">
          Billing and invoice management features are on our roadmap. Integration with Stripe is currently being finalized.
        </p>
      </div>
    </div>
  );
}
