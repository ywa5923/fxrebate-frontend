'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { BASE_URL } from '@/constants';
import type { DynamicOptionListResponse, DynamicOptionFilters } from '@/types/DynamicOption';

export async function getDynamicOptionList(
  page: number = 1,
  perPage: number = 25,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  filters?: DynamicOptionFilters
): Promise<DynamicOptionListResponse> {
  const log = logger.child('lib/dynamic-option-requests/getDynamicOptionList');
  
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
    if (filters?.category_name) {
      params.set('category_name', filters.category_name);
    }
    if (filters?.dropdown_category_name) {
      params.set('dropdown_category_name', filters.dropdown_category_name);
    }
    if (filters?.name) {
      params.set('name', filters.name);
    }
    if (filters?.applicable_for) {
      params.set('applicable_for', filters.applicable_for);
    }
    if (filters?.data_type) {
      params.set('data_type', filters.data_type);
    }
    if (filters?.form_type) {
      params.set('form_type', filters.form_type);
    }
    if (filters?.for_brokers) {
      params.set('for_brokers', filters.for_brokers);
    }
    if (filters?.for_crypto) {
      params.set('for_crypto', filters.for_crypto);
    }
    if (filters?.for_props) {
      params.set('for_props', filters.for_props);
    }
    if (filters?.required) {
      params.set('required', filters.required);
    }

    const response = await fetch(
      `${BASE_URL}/broker-options/get-list?${params.toString()}`,
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
      log.error('Error fetching dynamic option list', { error: msg });
      throw new Error(msg);
    }

    const data: DynamicOptionListResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch dynamic option list');
    }

    return data;
  } catch (err) {
    log.error('Error fetching dynamic option list', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

