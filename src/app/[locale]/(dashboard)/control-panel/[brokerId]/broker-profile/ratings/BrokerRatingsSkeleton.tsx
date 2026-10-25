import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BrokerRatingsSkeleton() {
  return (
    <div role="status" aria-label="Loading ratings and reviews" aria-busy="true">
      <div aria-hidden="true">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/2 py-3 pr-3 md:w-[30%]">Rating Type</TableHead>
              <TableHead className="w-1/2 py-3 md:w-[30%]">Rating Value</TableHead>
              <TableHead className="hidden w-1/5 py-3 md:table-cell">Created</TableHead>
              <TableHead className="hidden w-1/5 py-3 md:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 7 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="py-4 pr-3">
                  <Skeleton className="h-4 w-36 max-w-full" />
                  <Skeleton className="mt-2 h-3 w-14" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-4 w-[88px]" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="mt-3 space-y-2 md:hidden">
                    <Skeleton className="h-8 w-full max-w-36" />
                    <Skeleton className="h-8 w-full max-w-36" />
                  </div>
                </TableCell>
                <TableCell className="hidden py-4 md:table-cell">
                  <Skeleton className="h-3 w-28 max-w-full" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </TableCell>
                <TableCell className="hidden py-4 md:table-cell">
                  <Skeleton className="h-3 w-28 max-w-full" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-10">
          <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="space-y-4 py-6">
            <div className="flex flex-wrap justify-between gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
