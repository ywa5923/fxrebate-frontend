import { getZoneList } from '@/lib/zone-requests';
import { AddCountryForm } from './AddCountryForm';

export default async function AddCountryPage() {
  // Fetch zones for the select dropdown
  const zonesData = await getZoneList(1, 100);
  
  return (
    <AddCountryForm zones={zonesData?.data || []} />
  );
}

