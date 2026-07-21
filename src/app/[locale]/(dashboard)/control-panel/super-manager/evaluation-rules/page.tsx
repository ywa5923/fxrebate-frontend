
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { apiClient } from '@/lib/api-client';

import logger from '@/lib/logger';

import {EvaluationRule} from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';



interface EvaluationRulesPageProps {
    searchParams: Promise<SearchParams<EvaluationRule>>;
}


export default async function EvaluationRulesPage({ searchParams }: EvaluationRulesPageProps) {
  const log = logger.child('control-panel/super-manager/evaluation-rules/page.tsx');
  const params = await searchParams;

  const queryString = getQueryStringFromSearchParams(params);

  let url=`/evaluation-rules2?${queryString}`;
  log.debug("Fetching evaluation rules list", { url });
 
 const optionDataResponse= await apiClient<EvaluationRule[]>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching evaluation rules list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching evaluation rules list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for evaluation rules", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }
  


  return (
    <div className="flex-1 space-y-4">
     
      <FilterableTable
       propertyNameToDisplay="Evaluation Rules"
       data={optionDataResponse.data as unknown as EvaluationRule[]} 
       pagination={optionDataResponse.pagination as unknown as FTPagination}
       columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<EvaluationRule>} 
       filters={optionDataResponse.filters_config as unknown as FTFilters<EvaluationRule>}
       LOCAL_STORAGE_KEY="evaluation-rules-filters"
       formConfig={formConfig}
       getItemUrl={'/evaluation-rules2'}
       updateItemUrl={'/evaluation-rules2'}
       deleteUrl={'/evaluation-rules2'}
       />
       
    </div>
  );
}
