'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import logger from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const errorLogger = logger.child('team-management-error');
    errorLogger.error('Team management error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-white dark:bg-gray-900 border dark:border-gray-800">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {error.message || 'An unexpected error occurred while loading team management.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            This might be due to API server issues or invalid broker ID. Please check the server logs for more details.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="default" className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white">
              Try Again
            </Button>
            <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
              <Link href="/en/control-panel">Go Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
