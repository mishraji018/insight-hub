import { Code } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 border-b border-surface2">
        <div>
          <h1 className="text-2xl font-bold text-text">Developer API</h1>
          <p className="text-sm text-muted">Manage your API keys and webhook configurations</p>
        </div>
      </div>
      
      <div className="bg-surface border border-surface2 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4">
          <Code className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Coming Soon</h2>
        <p className="text-muted max-w-md">
          API key management and developer webhook settings will be available in the next release.
        </p>
      </div>
    </div>
  );
}
