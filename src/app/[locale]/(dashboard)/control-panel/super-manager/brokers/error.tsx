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
    const errorLogger = logger.child('brokers-list-error');
    errorLogger.error('Brokers list error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">
            Error Loading Brokers
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            {error.message || 'An unexpected error occurred while loading the brokers list.'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            This might be due to API server issues or network problems. Please check the server logs for more details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset} 
              variant="default" 
              className="bg-gray-700 hover:bg-gray-800 text-white w-full sm:w-auto"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              asChild
              className="w-full sm:w-auto"
            >
              <a href="/en/control-panel/super-manager">Go Back</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

