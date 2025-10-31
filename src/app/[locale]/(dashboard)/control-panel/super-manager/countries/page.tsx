import { Suspense } from 'react';
import { CountriesTableWrapper } from './CountriesTableWrapper';
import { TableSkeleton } from './TableSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CountriesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    name?: string;
    country_code?: string;
    zone_code?: string;
  }>;
}

export default async function CountriesPage({ searchParams }: CountriesPageProps) {
  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<TableSkeleton />}>
        <CountriesTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

