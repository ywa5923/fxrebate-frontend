import DropdownListForm from '../DropdownListForm';
import { createDropdownList } from '@/lib/dropdown-list-requests';

export default function AddDropdownListPage() {
  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Create New Dropdown List</div>
      <DropdownListForm onSubmitHandler={createDropdownList} submitButtonText="Create List" />
    </div>
  );
}



