'use server';

import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getBrokerList } from '@/lib/broker-management';
import { CreateBrokerPermissionForm } from './CreateBrokerPermissionForm';
import logger from '@/lib/logger';
import { PlatformUserListResponse } from '@/types/PlatformUser';

export async function CreateBrokerPermissionWrapper() {
  let log = logger.child('super-manager/user-permissions/create-broker-permission/wrapper');
  // Mirror Platform Users table behavior: same server action, no filters, but guard against API failures
  let platformUsers: Array<{ id: number; name: string; email: string }> = [];
  try {
    const platformUsersRes: PlatformUserListResponse = await getPlatformUserList(1, 1000);

    platformUsers = platformUsersRes?.data || [];
  } catch (error) {
    log.error('Error fetching platform users', { error: error instanceof Error ? error.message : error });
  }

  // Load brokers similarly (unfiltered) so user can select any broker
  let brokers: Array<{ id: number; trading_name: string }> = [];
  try {
    const brokersRes = await getBrokerList(1, 10000000);
    brokers = brokersRes?.data || [];
  } catch {
    brokers = [];
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
      <CreateBrokerPermissionForm platformUsers={platformUsers} brokers={brokers} />
    </div>
  );
}


