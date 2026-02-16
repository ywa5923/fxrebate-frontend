export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[60vh] gap-4">
      <div className="relative">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute top-0 left-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-transparent border-t-green-800 dark:border-t-green-500 animate-spin" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading content...</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
}
