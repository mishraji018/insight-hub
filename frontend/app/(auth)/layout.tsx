export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent2/20 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-surface border border-surface2 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center transform rotate-3">
            <span className="text-white font-bold text-xl transform -rotate-3">IH</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
