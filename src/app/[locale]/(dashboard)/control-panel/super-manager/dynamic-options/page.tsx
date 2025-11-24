import { getDynamicOptionList } from '@/lib/dynamic-option-requests';
import { DynamicOptionsTable } from './DynamicOptionsTable';
import FilterableTable from './FilterableTable';
import { apiClient } from '@/lib/api-client';
import { getBearerToken } from '@/lib/auth-actions';
import logger from '@/lib/logger';
import {BASE_URL} from '@/constants';
import { DynamicOptionListResponse } from '@/types/DynamicOption';
import XForm from './XForm';

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
  const log = logger.child('control-panel/super-manager/dynamic-options/page.tsx');
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

  interface BrokerOptionFormConfig {
    name: string;
    description: string;
    sections:Record<string, any>;
  }
  const optionData2 = await getDynamicOptionList(page, perPage, orderBy, orderDirection, filters);
  const bearerToken = await getBearerToken();


  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/broker-options/get-list?${queryString}`;
 
 const optionDataResponse = await apiClient<DynamicOptionListResponse>(url,bearerToken);
 if (!optionDataResponse.success || !optionDataResponse.data) {
  log.error("Error fetching options list", { message: optionDataResponse.message });
  throw new Error(optionDataResponse.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
  
  const res = await apiClient('/broker-options/form-data',bearerToken);
  if (!res.success) {
   log.error("Error fetching form meta data", { message: res.message });
   throw new Error(res.message || "Error fetching form meta data");
  }
  const formData = res.data.data as BrokerOptionFormConfig;

  log.info('formData',{formData});


  return (
    <div className="flex-1 space-y-4">
      {/*<DynamicOptionsTable 
        data={optionData?.data || []} 
        meta={optionData?.pagination}
        tableColumns={optionData?.table_columns}
      />*/}
      <XForm formDefinition={formData} />

     {/* 
      <FilterableTable
       data={optionData.data } 
       pagination={optionData.pagination}
       columnsConfig={optionData.table_columns_config} 
       filters={optionData.filters_config}
       LOCAL_STORAGE_KEY="dynamic-options-filters"
       
       />
       */}
    </div>
  );
}

