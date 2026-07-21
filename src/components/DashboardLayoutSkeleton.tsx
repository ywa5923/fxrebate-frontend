import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-svh w-full bg-[#FFF] dark:bg-black">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 border-r border-gray-200 dark:border-gray-800 bg-sidebar p-4">
        <div className="flex items-center gap-3 px-1">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mt-2 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
        </div>
        <div className="mt-auto space-y-2">
          <Skeleton className="h-8 w-full" />
          <div className="flex items-center gap-3 px-1 pt-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="hidden sm:block h-4 w-40" />
          <Skeleton className="hidden md:block h-4 w-24" />
          <Skeleton className="ml-auto size-8 rounded-md" />
        </header>
        <main className="flex-1 overflow-hidden bg-[#ffffff] dark:bg-gray-950 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
