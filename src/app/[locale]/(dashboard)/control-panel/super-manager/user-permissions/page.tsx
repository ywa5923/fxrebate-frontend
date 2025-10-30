import { Suspense } from 'react';
import { PermissionsTableWrapper } from './wrapper';
import { TableSkeleton } from './skeleton';

export default function UserPermissionsPage({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  return (
    <Suspense fallback={<TableSkeleton />}> 
      <PermissionsTableWrapper searchParams={searchParams} />
    </Suspense>
  );
}


