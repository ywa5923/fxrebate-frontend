import { getZoneList } from '@/lib/zone-requests';
import { AddCountryForm } from './AddCountryForm';

export async function AddCountryFormWrapper() {
  // Fetch zones for the select dropdown
  // We'll fetch a reasonable amount (e.g., 100) to get all zones
  const zonesData = await getZoneList(1, 100);
  
  return (
    <AddCountryForm zones={zonesData?.data || []} />
  );
}

