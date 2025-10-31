export default function EditDropdownListLoading() {
  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Edit Dropdown List</div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}


