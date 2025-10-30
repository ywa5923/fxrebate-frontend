import { Suspense } from 'react';
import { CreateSeoPermissionWrapper } from './wrapper';
import CreateSeoPermissionSkeleton from './skeleton';

export default function CreateSeoPermissionPage() {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<CreateSeoPermissionSkeleton /> }>
        <CreateSeoPermissionWrapper />
      </Suspense>
    </div>
  );
}


