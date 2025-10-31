import { TableSkeleton } from './skeleton';

export default function UserPermissionsLoading() {
  return (
    <div className="flex-1 space-y-4">
      <TableSkeleton />
    </div>
  );
}
