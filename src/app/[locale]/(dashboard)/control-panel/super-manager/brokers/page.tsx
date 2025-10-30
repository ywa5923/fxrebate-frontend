import { Suspense } from 'react';
import { BrokersTableWrapper } from './BrokersTableWrapper';
import { TableSkeleton } from './TableSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrokersPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    broker_type?: string;
    country?: string;
    zone?: string;
    trading_name?: string;
  }>;
}

export default async function BrokersPage({ searchParams }: BrokersPageProps) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Brokers</h2>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <BrokersTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

