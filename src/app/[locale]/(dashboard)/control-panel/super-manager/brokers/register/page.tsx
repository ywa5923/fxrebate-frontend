import { Suspense } from 'react';
import { RegisterBrokerFormWrapper } from './RegisterBrokerFormWrapper';
import { FormSkeleton } from './skeleton';

export default function RegisterBrokerPage() {
  return (
    <Suspense fallback={<FormSkeleton />}> 
      <RegisterBrokerFormWrapper />
    </Suspense>
  );
}

