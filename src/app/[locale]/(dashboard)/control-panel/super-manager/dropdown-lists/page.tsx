import { getDropdownLists } from '@/lib/dropdown-list-requests';
import { DropdownListsTable } from './DropdownListsTable';
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DropdownListsPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    
  }&Partial<DropdownList>>;
}

interface DropdownList {
  id: number;
  name: string;
  slug: string;
  description: string;
  options: string;
  created_at: string | null;
  updated_at?: string | null;
}

export default async function DropdownListsPage({ searchParams }: DropdownListsPageProps) {
  // const params = await searchParams;
  // const page = parseInt(params.page || '1');
  // const perPage = parseInt(params.per_page || '25');
  // const orderBy = params.order_by;
  // const orderDirection = params.order_direction;
  // const filters = {
  //   name: params.name,
  //   slug: params.slug,
  //   description: params.description,
  // };
  // const data = await getDropdownLists(page, perPage, orderBy, orderDirection, filters);

  // return (
  //   <div className="flex-1 space-y-4">
  //     <DropdownListsTable data={data?.data || []} meta={data?.pagination} />
  //   </div>
  // );
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/dropdown-lists/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/dropdown-lists?${queryString}`;
  const optionDataResponse= await apiClient<DropdownList>(url,true);
 //console.log("---------optionDataResponse", optionDataResponse);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  //log.error("Error fetching options list", { message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config", { message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
   
    <FilterableTable
     data={optionDataResponse.data as unknown as DropdownList[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<DropdownList>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<DropdownList>}
     LOCAL_STORAGE_KEY="dropdown-lists-filters"
     formConfig={formConfig}
     getItemUrl={`/dropdown-lists`}
     updateItemUrl={`/dropdown-lists`}
     />
     
  </div>);
}



