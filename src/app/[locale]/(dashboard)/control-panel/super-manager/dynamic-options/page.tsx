import { getDynamicOptionList } from '@/lib/dynamic-option-requests';
import { DynamicOptionsTable } from './DynamicOptionsTable';
import FilterableTable from './FilterableTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type BrokerOptionFilter = {
  category_name?: string;
  dropdown_category_name?: string;
  name?: string;
  applicable_for?: string;
  data_type?: string;
  form_type?: string;
  for_brokers?: string;
  for_crypto?: string;
  for_props?: string;
  required?: string;
};

type PaginationAndOrder = {
  page?: string;
  per_page?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
};

interface DynamicOptionsPageProps {
  searchParams: Promise<BrokerOptionFilter & PaginationAndOrder>;
}

export default async function DynamicOptionsPage({ searchParams }: DynamicOptionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const {
    category_name,
    dropdown_category_name,
    name,
    applicable_for,
    data_type,
    form_type,
    for_brokers,
    for_crypto,
    for_props,
    required,
  } = params;

  const filters = Object.fromEntries(
    Object.entries({
      category_name,
      dropdown_category_name,
      name,
      applicable_for,
      data_type,
      form_type,
      for_brokers,
      for_crypto,
      for_props,
      required,
    }).filter(([, v]) => v != null && v !== '')
  ) as BrokerOptionFilter;

  const optionData = await getDynamicOptionList(page, perPage, orderBy, orderDirection, filters);

  console.log("fsdfsffsdffsd",optionData.table_columns_config);

  return (
    <div className="flex-1 space-y-4">
      {/*<DynamicOptionsTable 
        data={optionData?.data || []} 
        meta={optionData?.pagination}
        tableColumns={optionData?.table_columns}
      />*/}
      <FilterableTable
       data={optionData.data } 
       pagination={optionData.pagination}
       columnsConfig={optionData.table_columns_config} 
       filters={optionData.filters_config}
       LOCAL_STORAGE_KEY="dynamic-options-filters"
       />
    </div>
  );
}

