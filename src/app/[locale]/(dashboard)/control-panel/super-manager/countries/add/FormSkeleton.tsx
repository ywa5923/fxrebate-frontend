import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function FormSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-2 pb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
          <div className="h-11 w-full sm:w-auto bg-gray-200 rounded animate-pulse" />
          <div className="h-11 w-full sm:w-auto bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

