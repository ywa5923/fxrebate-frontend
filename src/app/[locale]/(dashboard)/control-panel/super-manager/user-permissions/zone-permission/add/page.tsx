import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getZoneList } from '@/lib/zone-requests';
import { CreateZonePermissionForm } from './CreateZonePermissionForm';
import logger from '@/lib/logger';
import { PlatformUserListResponse } from '@/types/PlatformUser';

export default async function CreateZonePermissionPage() {
  const log = logger.child('super-manager/user-permissions/create-zone-permission');

  let platformUsers: Array<{ id: number; name: string; email: string }> = [];
  try {
    const platformUsersRes: PlatformUserListResponse = await getPlatformUserList(1, 1000);
    platformUsers = platformUsersRes?.data || [];
  } catch (error) {
    log.error('Error fetching platform users', { error: error instanceof Error ? error.message : error });
  }

  let zones: Array<{ id: number; name: string }> = [];
  try {
    const zonesRes = await getZoneList(1, 1000);
    zones = (zonesRes?.data || []).map((z: any) => ({ id: z.id, name: z.name }));
  } catch (error) {
    log.error('Error fetching zones', { error: error instanceof Error ? error.message : error });
  }

  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
        <CreateZonePermissionForm platformUsers={platformUsers} zones={zones} />
      </div>
    </div>
  );
}


