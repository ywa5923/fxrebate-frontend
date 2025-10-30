import { Suspense } from 'react';
import { EditSeoPermissionWrapper } from './wrapper';

export default function EditSeoPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <EditSeoPermissionWrapper params={params} />
      </Suspense>
    </div>
  );
}


