import { getZoneList } from '@/lib/zone-requests';
import { getCountryById } from '@/lib/country-requests';
import { EditCountryForm } from './EditCountryForm';
import { notFound } from 'next/navigation';

interface EditCountryFormWrapperProps {
  countryId: number;
}

export async function EditCountryFormWrapper({ countryId }: EditCountryFormWrapperProps) {
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

