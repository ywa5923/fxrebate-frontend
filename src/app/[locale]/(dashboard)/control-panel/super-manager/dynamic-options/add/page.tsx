export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CreateDynamicOptionForm from './CreateDynamicOptionForm';

export default function AddDynamicOptionPage() {
  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-xl font-semibold">Create New Dynamic Option</div>
      <CreateDynamicOptionForm />
    </div>
  );
}

