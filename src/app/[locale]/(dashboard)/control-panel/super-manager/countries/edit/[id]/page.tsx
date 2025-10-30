import { Suspense } from 'react';
import { EditCountryFormWrapper } from '../EditCountryFormWrapper';
import { FormSkeleton } from '@/app/[locale]/(dashboard)/control-panel/super-manager/countries/add/FormSkeleton';

interface EditCountryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCountryPage({ params }: EditCountryPageProps) {
  const { id } = await params;
  const countryId = parseInt(id, 10);

  if (isNaN(countryId)) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-0">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-500">Invalid country ID</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditCountryFormWrapper countryId={countryId} />
    </Suspense>
  );
}

