import { Suspense } from 'react';
import { EditBrokerPermissionWrapper } from './wrapper';

export default function EditBrokerPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
      
        <EditBrokerPermissionWrapper params={params} />
      </Suspense>
    </div>
  );
}


