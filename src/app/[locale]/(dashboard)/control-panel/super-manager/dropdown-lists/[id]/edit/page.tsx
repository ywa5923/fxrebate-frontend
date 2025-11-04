import { getDropdownList, updateDropdownList } from '@/lib/dropdown-list-requests';
import type { DropdownListOption } from '@/types/DropdownList';
import DropdownListForm from '../../DropdownListForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPageProps {
  params: Promise<{ id: string }>;
}

type FormValues = {
  list_name: string;
  description?: string | null;
  options: Array<{ label: string; value: string }>;
};

export default async function EditDropdownListPage({ params }: EditPageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  const res = await getDropdownList(numericId);
  if (!res.success || !res.data) {
    notFound();
  }

  // Convert DropdownList to FormValues format
  const defaultValues: FormValues = {
    list_name: res.data.name || '',
    description: res.data.description || null,
    options: (res.data.options || []).map((o: DropdownListOption) => ({
      label: (o as any).label || o.value, // Use label if available, otherwise use value
      value: o.value,
    })),
  };


  // Create server action for update
  async function handleUpdate(
    list_name: string,
    description: string | null,
    options: Array<{ label: string; value: string }>
  ) {
    'use server';
    return await updateDropdownList(
      numericId,
      list_name,
      description,
      options,
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Edit Dropdown List</div>
      <DropdownListForm
        defaultValues={defaultValues}
        onSubmitHandler={handleUpdate}
        submitButtonText="Update List"
      />
    </div>
  );
}


