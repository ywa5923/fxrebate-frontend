'use server';

import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getCountryList } from '@/lib/country-requests';
import { CreateSeoPermissionForm } from './CreateSeoPermissionForm';
import logger from '@/lib/logger';
import { PlatformUserListResponse } from '@/types/PlatformUser';

export async function CreateSeoPermissionWrapper() {
  const log = logger.child('super-manager/user-permissions/create-seo-permission/wrapper');

  let platformUsers: Array<{ id: number; name: string; email: string }> = [];
  try {
    const platformUsersRes: PlatformUserListResponse = await getPlatformUserList(1, 1000);
    platformUsers = platformUsersRes?.data || [];
  } catch (error) {
    log.error('Error fetching platform users', { error: error instanceof Error ? error.message : error });
  }

  let countries: Array<{ id: number; name: string; country_code: string }> = [];
  try {
    const countriesRes = await getCountryList(1, 1000);
    countries = (countriesRes?.data || []).map((c: any) => ({ id: c.id, name: c.name, country_code: c.country_code }));
  } catch (error) {
    log.error('Error fetching countries', { error: error instanceof Error ? error.message : error });
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
      <CreateSeoPermissionForm platformUsers={platformUsers} countries={countries} />
    </div>
  );
}


