'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="font-semibold text-red-700">Error loading permissions</h2>
      <p className="text-sm text-red-600 mt-1">
        {error?.message || 'Unexpected error'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-3 text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}


