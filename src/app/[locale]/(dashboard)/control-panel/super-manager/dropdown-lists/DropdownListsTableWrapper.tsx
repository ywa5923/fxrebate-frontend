import { getDropdownLists } from '@/lib/dropdown-list-requests';
import { DropdownListsTable } from './DropdownListsTable';
import logger from '@/lib/logger';

interface DropdownListsTableWrapperProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    name?: string;
    slug?: string;
    description?: string;
  }>;
}

export async function DropdownListsTableWrapper({ searchParams }: DropdownListsTableWrapperProps) {
  const pageLogger = logger.child('control-panel/super-manager/dropdown-lists/DropdownListsTableWrapper.tsx');
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');

  const filters = {
    name: params.name,
    slug: params.slug,
    description: params.description,
  };

  pageLogger.debug('Loading dropdown lists', { page, perPage, filters });

  const data = await getDropdownLists(page, perPage, undefined, undefined, filters);

  pageLogger.debug('Dropdown lists received', { 
    hasData: !!data?.data,
    dataLength: data?.data?.length,
    hasPagination: !!data?.pagination 
  });

  return (
    <DropdownListsTable 
      data={data?.data || []} 
      meta={data?.pagination}
    />
  );
}



