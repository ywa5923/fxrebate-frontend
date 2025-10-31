import { getDropdownLists } from '@/lib/dropdown-list-requests';
import { DropdownListsTable } from './DropdownListsTable';

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
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const filters = {
    name: params.name,
    slug: params.slug,
    description: params.description,
  };
  const data = await getDropdownLists(page, perPage, undefined, undefined, filters);

  return (
    <div className="flex-1 space-y-4">
      <DropdownListsTable data={data?.data || []} meta={data?.pagination} />
    </div>
  );
}



