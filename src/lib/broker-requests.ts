'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { revalidatePath } from 'next/cache';
import { BASE_URL } from '@/constants';
import { registerBrokerSchema } from '@/app/schemas/broker-schema';
import type { BrokerMetaDataResponse, RegisterBrokerData, RegisterBrokerResponse } from '@/types/Broker';

export async function getBrokerTypesAndCountries(): Promise<BrokerMetaDataResponse> {
  const log = logger.child('lib/broker-requests/getBrokerTypesAndCountries');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${BASE_URL}/brokers/broker-types-and-countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
      log.error('Failed fetching broker meta', { status: response.status, error: errorMessage });
      throw new Error(errorMessage);
    }

    const data: BrokerMetaDataResponse = await response.json();
    if (!data.success) {
      log.error('API returned success: false', { data });
      throw new Error(data.message || 'Failed to fetch broker meta');
    }
    return data;
  } catch (err) {
    log.error('Error fetching broker meta', { error: err instanceof Error ? err.message : err });
    throw err;
  }
}

export async function registerBroker(payload: RegisterBrokerData): Promise<RegisterBrokerResponse> {
  const log = logger.child('lib/broker-requests/registerBroker');
  try {
    const validation = registerBrokerSchema.safeParse(payload);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, message: `Validation failed: ${errors}` };
    }

    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await fetch(`${BASE_URL}/register-broker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(validation.data),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error registering broker', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }

    revalidatePath('/en/control-panel/super-manager/brokers');
    return { success: true, message: data?.message || 'Broker registered successfully', data: data?.data };
  } catch (err) {
    log.error('Exception registering broker', { error: err instanceof Error ? err.message : err });
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}


