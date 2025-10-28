'use server';

import { toggleBrokerActiveStatus } from '@/lib/broker-management';
import { revalidatePath } from 'next/cache';

export async function toggleBrokerStatus(brokerId: number) {
  const result = await toggleBrokerActiveStatus(brokerId);
  
  if (result.success) {
    revalidatePath('/en/control-panel/super-manager/brokers');
  }
  
  return result;
}

