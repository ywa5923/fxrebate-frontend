import { BASE_URL } from '@/constants';
export const getZoneByCountry = async  (country: string): Promise<string | null> => {

    try {
        const response = await fetch(`${BASE_URL}/zones?country[eq]=${country}`);
        if (!response.ok) {
            console.error(`Failed to fetch country code: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data?.zone || null;
      } catch (error) {
        console.error('Error fetching zone:', error);
        return null;
      }
}