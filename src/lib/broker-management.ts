'use server';

import { BASE_URL } from '@/constants';
import { getBearerToken } from './auth-actions';
import logger from './logger';

export interface Broker {
  id: number;
  broker_type: string;
  country_id: number | null;
  zone_id: number | null;
  country_code: string | null;
  zone_code: string | null;
  logo: string;
  trading_name: string;
  home_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrokerListResponse {
  success: boolean;
  data: Broker[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface BrokerFilters {
  broker_type?: string;
  country?: string;
  zone?: string;
  trading_name?: string;
}

export async function getBrokerList(
  page: number = 1,
  perPage: number = 25,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  filters?: BrokerFilters
): Promise<BrokerListResponse> {
  const log = logger.child('lib/broker-management/getBrokerList');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (orderBy) {
      params.set('order_by', orderBy);
    }
    if (orderDirection) {
      params.set('order_direction', orderDirection);
    }
    
    // Add filters
    if (filters?.broker_type) {
      params.set('broker_type', filters.broker_type);
    }
    if (filters?.country) {
      params.set('country', filters.country);
    }
    if (filters?.zone) {
      params.set('zone', filters.zone);
    }
    if (filters?.trading_name) {
      params.set('trading_name', filters.trading_name);
    }

    const response = await fetch(
      `${BASE_URL}/brokers/broker-list?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        next: { revalidate: 0 }
      }
    );

    if (!response.ok) {
      const msg = `HTTP error: ${response.status}`;
      log.error('Error fetching broker list', { error: msg });
      throw new Error(msg);
    }

    const data: BrokerListResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch broker list');
    }

    log.debug('Broker list fetched successfully', { 
      count: data.data.length,
      page 
    });

    return data;
  } catch (err) {
    log.error('Error fetching broker list', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

export async function toggleBrokerActiveStatus(brokerId: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/broker-management/toggleBrokerActiveStatus');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(
      `${BASE_URL}/brokers/toggle-active-status/${brokerId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      const msg = `HTTP error: ${response.status}`;
      log.error('Error toggling broker active status', { error: msg });
      throw new Error(msg);
    }

    const data = await response.json();

    log.debug('Broker active status toggled successfully', { brokerId });

    return { success: true, message: data.message };
  } catch (err) {
    log.error('Error toggling broker active status', { 
      error: err instanceof Error ? err.message : err 
    });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

