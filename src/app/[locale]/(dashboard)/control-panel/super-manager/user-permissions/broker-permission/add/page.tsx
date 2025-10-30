import { Suspense } from 'react';
import { CreateBrokerPermissionWrapper } from './wrapper';
import CreateBrokerPermissionSkeleton from './skeleton';

export default function CreateBrokerPermissionPage() {
  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <Suspense fallback={<CreateBrokerPermissionSkeleton />}>
        <CreateBrokerPermissionWrapper />
      </Suspense>
    </div>
  );
}


