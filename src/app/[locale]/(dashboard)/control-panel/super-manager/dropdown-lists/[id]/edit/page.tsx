import { getDropdownList } from '@/lib/dropdown-list-requests';
import EditDropdownListForm from './EditDropdownListForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDropdownListPage({ params }: EditPageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  const res = await getDropdownList(numericId);

  if (!res.success || !res.data) {
    return (
      <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
        <div className="text-xl font-semibold">Edit Dropdown List</div>
        <div className="text-red-600">Failed to load dropdown list.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Edit Dropdown List</div>
      <EditDropdownListForm initial={res.data} />
    </div>
  );
}


