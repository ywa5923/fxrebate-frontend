export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CreateDropdownListForm from './CreateDropdownListForm';

export default function AddDropdownListPage() {
  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Create New Dropdown List</div>
      <CreateDropdownListForm />
    </div>
  );
}



