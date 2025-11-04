export const dynamic = 'force-dynamic';
export const revalidate = 0;

import DynamicOptionForm from '../DynamicOptionForm';
import { getAllDropdownLists } from '@/lib/dropdown-list-requests';
import { getOptionCategories, getFormMetaData, createDynamicOption } from '@/lib/dynamic-option-requests';

export default async function AddDynamicOptionPage() {
  // Fetch all data in parallel using Promise.all
  const [dropdownListsResult, optionCategoriesResult, formMetaDataResult] = await Promise.all([
    getAllDropdownLists(),
    getOptionCategories(),
    getFormMetaData(),
  ]);

  if (!dropdownListsResult?.success || !optionCategoriesResult?.success || !formMetaDataResult?.success) {
    throw new Error('Failed to load dynamic option dependencies');
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Create New Dynamic Option</div>
      <DynamicOptionForm
        onSubmitHandler={createDynamicOption}
        submitButtonText="Create Dynamic Option"
        dropdownLists={dropdownListsResult.data || []}
        optionCategories={optionCategoriesResult.data || []}
        formMetaData={formMetaDataResult.data || null}
      />
    </div>
  );
}

