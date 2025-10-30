import { Suspense } from 'react';
import { EditZonePermissionWrapper } from './wrapper';

export default function EditZonePermissionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
      
        <EditZonePermissionWrapper params={params} />
      </Suspense>
    </div>
  );
}


