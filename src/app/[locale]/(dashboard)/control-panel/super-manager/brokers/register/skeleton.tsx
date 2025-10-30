export function FormSkeleton() {
  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
        <div className="space-y-3 mt-4">
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}


