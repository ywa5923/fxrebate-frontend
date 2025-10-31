import { Suspense } from 'react';
import { ZonesTableWrapper } from './ZonesTableWrapper';
import { TableSkeleton } from './TableSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ZonesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    name?: string;
    zone_code?: string;
  }>;
}

export default async function ZonesPage({ searchParams }: ZonesPageProps) {
  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<TableSkeleton />}>
        <ZonesTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

