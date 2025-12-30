import { TableSkeleton } from '@/components/FilterableTable/TableSkeleton';

export default function DynamicOptionsLoading() {
  return (
    <div className="flex-1 space-y-4">
      <TableSkeleton />
    </div>
  );
}
