import { getZoneList } from '@/lib/zone-requests';
import { getCountryById } from '@/lib/country-requests';
import { EditCountryForm } from '../EditCountryForm';
import { notFound } from 'next/navigation';

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

  // Fetch zones for the select dropdown
  const zonesData = await getZoneList(1, 100);
  
  // Fetch country data
  try {
    const countryData = await getCountryById(countryId);
    
    if (!countryData.success || !countryData.data) {
      notFound();
    }

    return (
      <EditCountryForm zones={zonesData?.data || []} country={countryData.data} />
    );
  } catch (error) {
    notFound();
  }
}

