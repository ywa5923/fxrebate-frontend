import { Suspense } from 'react';
import { AddCountryFormWrapper } from './AddCountryFormWrapper';
import { FormSkeleton } from './FormSkeleton';

export default function AddCountryPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AddCountryFormWrapper />
    </Suspense>
  );
}

