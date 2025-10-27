'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-2">
            {error.message || 'An unexpected error occurred while loading team management.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This might be due to API server issues or invalid broker ID. Please check the server logs for more details.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="default" className="bg-gray-700 hover:bg-gray-800 text-white">
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <a href="/en/control-panel">Go Back</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
