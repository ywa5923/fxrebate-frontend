import { Suspense } from 'react';
import { CreateCountryPermissionWrapper } from './wrapper';
import CreateCountryPermissionSkeleton from './skeleton';

export default function CreateCountryPermissionPage() {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<CreateCountryPermissionSkeleton /> }>
        <CreateCountryPermissionWrapper />
      </Suspense>
    </div>
  );
}


