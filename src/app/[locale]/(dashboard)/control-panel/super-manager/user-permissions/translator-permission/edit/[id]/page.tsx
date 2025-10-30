import { Suspense } from 'react';
import { EditTranslatorPermissionWrapper } from './wrapper';

export default function EditTranslatorPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense>
        {/* @ts-expect-error Async Server Component */}
        <EditTranslatorPermissionWrapper params={params} />
      </Suspense>
    </div>
  );
}



