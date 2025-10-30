import { Suspense } from 'react';
import { CreateTranslatorPermissionWrapper } from './wrapper';
import CreateTranslatorPermissionSkeleton from './skeleton';

export default function CreateTranslatorPermissionPage() {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<CreateTranslatorPermissionSkeleton /> }>
        <CreateTranslatorPermissionWrapper />
      </Suspense>
    </div>
  );
}



