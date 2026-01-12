import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
  showChart?: boolean;
  showActions?: boolean;
}

export const SkeletonCard = ({ 
  className, 
  lines = 3, 
  showHeader = true,
  showChart = false,
  showActions = false
}: SkeletonCardProps) => {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card p-6 space-y-4",
      className
    )}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          {showActions && <Skeleton className="w-8 h-8 rounded-lg" />}
        </div>
      )}
      
      {showChart ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-4",
                i === lines - 1 ? "w-3/4" : "w-full"
              )} 
            />
          ))}
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      )}
    </div>
  );
};

export const SkeletonMetricCard = ({ className }: { className?: string }) => (
  <div className={cn(
    "rounded-2xl border border-border bg-card p-6",
    className
  )}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="rounded-xl border border-border overflow-hidden">
    {/* Header */}
    <div className="bg-muted/50 p-4 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-t border-border flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
    
    {/* Metrics row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonCard className="lg:col-span-2" showChart lines={0} />
      <SkeletonCard lines={5} />
    </div>
  </div>
);
