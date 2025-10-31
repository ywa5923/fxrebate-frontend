import { TableSkeleton } from './TableSkeleton';

export default function CountriesLoading() {
  return (
    <div className="flex-1 space-y-4">
      <TableSkeleton />
    </div>
  );
}

