import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TableSkeleton() {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 font-semibold w-12">#</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Subject Type</TableHead>
              <TableHead>Subject ID</TableHead>
              <TableHead>Permission Type</TableHead>
              <TableHead>Resource ID</TableHead>
              <TableHead>Resource Value</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="bg-gray-50"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-48 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


