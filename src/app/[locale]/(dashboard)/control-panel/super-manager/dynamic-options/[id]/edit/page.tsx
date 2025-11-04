export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDynamicOption, updateDynamicOption, getOptionCategories, getFormMetaData } from '@/lib/dynamic-option-requests';
import { getAllDropdownLists } from '@/lib/dropdown-list-requests';
import DynamicOptionForm from '../../DynamicOptionForm';
import type { DynamicOptionForm as DynamicOptionFormType } from '@/types/DynamicOption';
import logger from '@/lib/logger';
import { notFound } from 'next/navigation';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDynamicOptionPage({ params }: EditPageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  const pageLogger = logger.child('control-panel/super-manager/dynamic-options/[id]/edit/page.tsx');

  // Fetch all data in parallel
  const [dynamicOptionResult, dropdownListsResult, optionCategoriesResult, formMetaDataResult] = await Promise.all([
    getDynamicOption(numericId),
    getAllDropdownLists(),
    getOptionCategories(),
    getFormMetaData(),
  ]);

  

  if (!dynamicOptionResult?.success || !dynamicOptionResult?.data) {
    pageLogger.warn('Dynamic option not found or failed', { id: numericId, message: dynamicOptionResult?.message });
    notFound();
  }

  const option = dynamicOptionResult.data;
 
 

  // Create server action for update
  async function handleUpdate(input: DynamicOptionFormType) {
    'use server';
    return await updateDynamicOption(numericId, input);
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Edit Dynamic Option</div>
      <DynamicOptionForm
        defaultValues={option}
        onSubmitHandler={handleUpdate}
        submitButtonText="Update Dynamic Option"
        dropdownLists={dropdownListsResult?.success ? dropdownListsResult.data || [] : []}
        optionCategories={optionCategoriesResult?.success ? optionCategoriesResult.data || [] : []}
        formMetaData={formMetaDataResult?.success ? formMetaDataResult.data || null : null}
      />
    </div>
  );
}

