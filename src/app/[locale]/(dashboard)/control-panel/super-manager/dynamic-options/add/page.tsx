export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CreateDynamicOptionForm from './CreateDynamicOptionForm';
import { getAllDropdownLists } from '@/lib/dropdown-list-requests';
import { getOptionCategories, getFormMetaData } from '@/lib/dynamic-option-requests';

export default async function AddDynamicOptionPage() {
  // Fetch all data in parallel using Promise.all
  let dropdownListsResult, optionCategoriesResult, formMetaDataResult;
  
  try {
    [dropdownListsResult, optionCategoriesResult, formMetaDataResult] = await Promise.all([
      getAllDropdownLists(),
      getOptionCategories(),
      getFormMetaData(),
    ]);
  } catch (error) {
    // Handle errors gracefully - initialize with empty values
    dropdownListsResult = { success: false, data: [] };
    optionCategoriesResult = { success: false, data: [] };
    formMetaDataResult = { success: false, data: null };
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Create New Dynamic Option</div>
      <CreateDynamicOptionForm
        dropdownLists={dropdownListsResult?.success ? dropdownListsResult.data || [] : []}
        optionCategories={optionCategoriesResult?.success ? optionCategoriesResult.data || [] : []}
        formMetaData={formMetaDataResult?.success ? formMetaDataResult.data || null : null}
      />
    </div>
  );
}

