import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface MatrixLoadingOverlayProps {
  loading: boolean;
}

/**
 * Overlay shown on top of the matrix while data is (re)loading.
 * Kept as a separate component so StaticMatrix stays lean.
 */
export function MatrixLoadingOverlay({ loading }: MatrixLoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Loading matrix...
        </span>
      </div>
    </div>
  );
}

/** A single shimmering placeholder block. */
function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700",
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  );
}

interface MatrixSkeletonProps {
  /** Number of data columns to render in the skeleton grid. */
  columns?: number;
  /** Number of data rows to render in the skeleton grid. */
  rows?: number;
  className?: string;
}

/**
 * Animated placeholder that mirrors the matrix grid layout while the real
 * data is loading. Uses a shimmer sweep over pulsing blocks.
 */
export function MatrixSkeleton({
  columns = 4,
  rows = 5,
  className,
}: MatrixSkeletonProps) {
  const gridTemplate = `minmax(140px, 200px) repeat(${columns}, minmax(120px, 1fr))`;

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden rounded-lg border border-gray-200 p-4 dark:border-gray-700",
        className,
      )}
      style={{ "--matrix-skeleton-template": gridTemplate } as CSSProperties}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="grid gap-3 grid-cols-[var(--matrix-skeleton-template)]">
          <ShimmerBlock className="h-6" />
          {Array.from({ length: columns }).map((_, colIndex) => (
            <ShimmerBlock key={`sk-head-${colIndex}`} className="h-6" />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`sk-row-${rowIndex}`}
            className="grid gap-3 grid-cols-[var(--matrix-skeleton-template)]"
          >
            <ShimmerBlock className="h-11" />
            {Array.from({ length: columns }).map((_, colIndex) => (
              <ShimmerBlock
                key={`sk-cell-${rowIndex}-${colIndex}`}
                className="h-11"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatrixLoadingOverlay;
