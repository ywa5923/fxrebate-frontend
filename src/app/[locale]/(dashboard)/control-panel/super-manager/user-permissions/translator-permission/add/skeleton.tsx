export default function CreateTranslatorPermissionSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
      <div className="animate-pulse">
        <div className="h-6 w-64 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-28 bg-gray-200 rounded" />
          <div className="h-9 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}



