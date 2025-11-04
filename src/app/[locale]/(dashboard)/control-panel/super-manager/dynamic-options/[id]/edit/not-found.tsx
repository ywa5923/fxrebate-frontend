'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const params = useParams() as { locale?: string };
  const locale = params?.locale || 'en';

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Dynamic Option Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            The requested dynamic option could not be found or is unavailable.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <a href={`/${locale}/control-panel/super-manager/dynamic-options`}>Go Back</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


