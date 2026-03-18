import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse'
}

function Skeleton({ className, variant = 'shimmer', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface2",
        variant === 'shimmer' && "skeleton-shimmer",
        variant === 'pulse' && "animate-pulse",
        variant === 'default' && "bg-surface2",
        className
      )}
      {...props}
    />
  )
}

/** Card skeleton — matches stat card layout */
function StatCardSkeleton() {
  return (
    <div className="premium-card p-5 overflow-hidden border border-surface2/50">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-28 h-9 mb-2 rounded-lg" />
      <Skeleton className="w-20 h-4 rounded-md" />
    </div>
  )
}

/** Chart skeleton — full-height placeholder with shimmer */
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {/* Y-axis hint lines */}
      <div className="flex items-end gap-1 h-[260px] w-full px-4">
        {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45].map((h, i) => (
          <Skeleton
            key={i}
            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s` }}
            className="flex-1 rounded-t-md skeleton-shimmer"
          />
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-1 px-4">
        {[60, 48, 52, 58, 50, 56, 44].map((w, i) => (
          <Skeleton key={i} style={{ width: `${w}px` }} className="h-3 flex-1 rounded" />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, StatCardSkeleton, ChartSkeleton }
