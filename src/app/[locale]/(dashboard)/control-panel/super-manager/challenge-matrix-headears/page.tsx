
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { apiClient } from '@/lib/api-client';

import logger from '@/lib/logger';

import {ChallengeMatrixHeadear} from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';



interface ChallengeMatrixHeadearsPageProps {
    searchParams: Promise<SearchParams<ChallengeMatrixHeadear>>;
}


export default async function ChallengeMatrixHeadearsPage({ searchParams }: ChallengeMatrixHeadearsPageProps) {
  const log = logger.child('control-panel/super-manager/challenge-matrix-headears/page.tsx');
  const params = await searchParams;

  const queryString = getQueryStringFromSearchParams(params);

  let url=`/challenge-matrix-headears?${queryString}`;
  log.debug("Fetching challenge matrix headears list", { url });
 
 const optionDataResponse= await apiClient<ChallengeMatrixHeadear[]>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching challenge matrix headears list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching challenge matrix headears list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for challenge matrix headears", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }
  


  return (
    <div className="flex-1 space-y-4">
     
      <FilterableTable
       propertyNameToDisplay="Challenge Matrix Headears"
       data={optionDataResponse.data as unknown as ChallengeMatrixHeadear[]} 
       pagination={optionDataResponse.pagination as unknown as FTPagination}
       columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<ChallengeMatrixHeadear>} 
       filters={optionDataResponse.filters_config as unknown as FTFilters<ChallengeMatrixHeadear>}
       LOCAL_STORAGE_KEY="challenge-matrix-headears-filters"
       formConfig={formConfig}
       getItemUrl={'/challenge-matrix-headears'}
       updateItemUrl={'/challenge-matrix-headears'}
       deleteUrl={'/challenge-matrix-headears'}
       />
       
    </div>
  );
}
