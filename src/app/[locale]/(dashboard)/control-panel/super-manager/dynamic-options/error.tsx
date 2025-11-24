'use client';
import { Card, CardContent } from "@/components/ui/card";
import logger from "@/lib/logger";
import { useEffect } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const errorLogger = logger.child('dynamic-options-error');
    errorLogger.error('Dynamic options error', {
      message: error.message,   
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
            Error Loading Dynamic Options
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            {error.message || 'An unexpected error occurred while loading the dynamic options.'}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}