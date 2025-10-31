import { Suspense } from 'react';
import { DropdownListsTableWrapper } from './DropdownListsTableWrapper';
import { TableSkeleton } from './TableSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DropdownListsPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    name?: string;
    slug?: string;
    description?: string;
  }>;
}

export default async function DropdownListsPage({ searchParams }: DropdownListsPageProps) {
  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<TableSkeleton />}>
        <DropdownListsTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}



