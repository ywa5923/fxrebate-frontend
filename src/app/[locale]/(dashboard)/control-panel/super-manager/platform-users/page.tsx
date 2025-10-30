import { Suspense } from 'react';
import { PlatformUsersTableWrapper } from './wrapper';
import { TableSkeleton } from './skeleton';

export default function PlatformUsersPage({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  return (
    <Suspense fallback={<TableSkeleton />}> 
      <PlatformUsersTableWrapper searchParams={searchParams} />
    </Suspense>
  );
}


