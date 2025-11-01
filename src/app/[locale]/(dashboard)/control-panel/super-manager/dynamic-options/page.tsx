import { getDynamicOptionList } from '@/lib/dynamic-option-requests';
import { DynamicOptionsTable } from './DynamicOptionsTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DynamicOptionsPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
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
  }>;
}

export default async function DynamicOptionsPage({ searchParams }: DynamicOptionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    category_name: params.category_name,
    dropdown_category_name: params.dropdown_category_name,
    name: params.name,
    applicable_for: params.applicable_for,
    data_type: params.data_type,
    form_type: params.form_type,
    for_brokers: params.for_brokers,
    for_crypto: params.for_crypto,
    for_props: params.for_props,
    required: params.required,
  };

  const optionData = await getDynamicOptionList(page, perPage, orderBy, orderDirection, filters);

  return (
    <div className="flex-1 space-y-4">
      <DynamicOptionsTable 
        data={optionData?.data || []} 
        meta={optionData?.pagination}
        tableColumns={optionData?.table_columns}
      />
    </div>
  );
}

