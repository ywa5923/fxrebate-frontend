import { cookies } from 'next/headers';
export const getZoneFromCookie = async ():Promise<string | null> => {

     const cookieStore = await cookies();
     const zone = cookieStore.get('zone')?.value || null;
     return zone
}