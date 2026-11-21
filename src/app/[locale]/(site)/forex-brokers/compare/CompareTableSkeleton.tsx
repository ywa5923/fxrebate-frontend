export default function CompareTableSkeleton() {
  return (
    <section
      aria-label="Loading broker reviews"
      aria-busy="true"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-11 w-full max-w-[429px] animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
        <div className="flex gap-2">
          <div className="h-11 w-36 animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
          <div className="h-11 w-32 animate-pulse rounded-md bg-[#0c110f]/10 dark:bg-white/10" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-[#0c110f]/15 dark:border-white/15">
        <div className="grid grid-cols-4 gap-4 border-b border-[#0c110f]/15 px-4 py-4 dark:border-white/15">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`header-${index}`}
              className="h-4 animate-pulse rounded bg-[#0c110f]/10 dark:bg-white/10"
            />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-4 gap-4 border-b border-[#0c110f]/10 px-4 py-8 last:border-b-0 dark:border-white/10"
          >
            {Array.from({ length: 4 }, (_, columnIndex) => (
              <div
                key={`cell-${rowIndex}-${columnIndex}`}
                className="h-5 animate-pulse rounded bg-[#0c110f]/10 dark:bg-white/10"
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading broker reviews…</span>
    </section>
  );
}
