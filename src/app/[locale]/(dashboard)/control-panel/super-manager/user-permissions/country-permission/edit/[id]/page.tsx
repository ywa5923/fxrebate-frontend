import { Suspense } from 'react';
import { EditCountryPermissionWrapper } from './wrapper';

export default function EditCountryPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
      
        <EditCountryPermissionWrapper params={params} />
      </Suspense>
    </div>
  );
}


