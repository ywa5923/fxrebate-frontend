export default function RebatesSkeleton() {
  return (
    <section aria-label="Loading rebate offers" aria-busy="true" className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          <div className="h-11 w-full max-w-[429px] animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
          <div className="h-11 w-32 animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
        </div>
        <div className="flex gap-2">
          <div className="h-12 w-36 animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
          <div className="h-12 w-32 animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-lg border border-[#0c110f]/10 bg-[#0c110f]/5 dark:border-white/10 dark:bg-white/5"
          />
        ))}
      </div>
      <span className="sr-only">Loading rebate offers…</span>
    </section>
  );
}
