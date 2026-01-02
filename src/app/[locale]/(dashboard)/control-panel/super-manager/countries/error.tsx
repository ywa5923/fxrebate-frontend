'use client';

import { useEffect } from "react";
import logger from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const errorLogger = logger.child('countries-error');
    errorLogger.error('Countries list error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="font-semibold text-red-700">Error loading countries</h2>
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
