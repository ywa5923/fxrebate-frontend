import { TableSkeleton } from '@/components/FilterableTable/TableSkeleton';

export default function DropdownListsLoading() {
  return (
    <div className="flex-1 space-y-4">
      <TableSkeleton />
    </div>
  );
}


