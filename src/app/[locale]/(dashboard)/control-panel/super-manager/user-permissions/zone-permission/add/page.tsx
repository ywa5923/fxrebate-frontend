import { Suspense } from 'react';
import { CreateZonePermissionWrapper } from './wrapper';
import CreateZonePermissionSkeleton from './skeleton';

export default function CreateZonePermissionPage() {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<CreateZonePermissionSkeleton /> }>
        <CreateZonePermissionWrapper />
      </Suspense>
    </div>
  );
}


