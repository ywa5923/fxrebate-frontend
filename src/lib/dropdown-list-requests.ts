'use server';

import logger from './logger';
import { getBearerToken } from './auth-actions';
import type { DropdownListListResponse, DropdownListFilters } from '@/types';
import type { DropdownList } from '@/types/DropdownList';
import { BASE_URL } from '@/constants';



export async function getDropdownLists(
  page: number = 1,
  perPage: number = 25,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  filters?: DropdownListFilters
): Promise<DropdownListListResponse> {
  const log = logger.child('lib/dropdown-list-requests/getDropdownLists');

  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (orderBy) params.set('order_by', orderBy);
    if (orderDirection) params.set('order_direction', orderDirection);
    if (filters?.name) params.set('name', filters.name);
    if (filters?.slug) params.set('slug', filters.slug);
    if (filters?.description) params.set('description', filters.description);

    const response = await fetch(`${BASE_URL}/dropdown-list?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const msg = `HTTP error: ${response.status}`;
      log.error('Error fetching dropdown lists', { error: msg });
      throw new Error(msg);
    }

    const data: DropdownListListResponse = await response.json();
    if (!data.success) {
      throw new Error('Failed to fetch dropdown lists');
    }
    return data;
  } catch (err) {
    log.error('Error fetching dropdown lists', {
      error: err instanceof Error ? err.message : err,
    });
    throw err;
  }
}

export interface CreateDropdownListOptionInput {
  label: string;
  value: string;
}

export async function createDropdownList(
  list_name: string,
  description: string | null,
  options: CreateDropdownListOptionInput[],
): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dropdown-list-requests/createDropdownList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/dropdown-list/store-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify({ list_name, description, options }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error creating dropdown list', { status: response.status, message });
      return { success: false, message };
    }
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error creating dropdown list', { error: err instanceof Error ? err.message : err });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateDropdownList(
  id: number,
  list_name: string,
  description: string | null,
  options: CreateDropdownListOptionInput[],
): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dropdown-list-requests/updateDropdownList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/dropdown-list/update-list/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify({ list_name, description, options }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error updating dropdown list', { status: response.status, message, id });
      return { success: false, message };
    }
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error updating dropdown list', { error: err instanceof Error ? err.message : err, id });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getDropdownList(id: number): Promise<{ success: boolean; data?: DropdownList; message?: string }> {
  const log = logger.child('lib/dropdown-list-requests/getDropdownList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/dropdown-list/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      next: { revalidate: 0 },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error fetching dropdown list', { status: response.status, message, id });
      return { success: false, message };
    }
    // Support different API shapes
    const payload = (data?.data && typeof data.data === 'object') ? data.data
      : (data && typeof data === 'object' && data.id && data.name) ? data
      : undefined;
    if (!payload) {
      log.error('Unexpected response shape for dropdown list', { data });
      return { success: false, message: 'Unexpected response shape' };
    }
    return { success: true, data: payload as DropdownList };
  } catch (err) {
    log.error('Error fetching dropdown list', { error: err instanceof Error ? err.message : err, id });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteDropdownList(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dropdown-list-requests/deleteDropdownList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/dropdown-list/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error deleting dropdown list', { status: response.status, message, id });
      return { success: false, message };
    }
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error deleting dropdown list', { error: err instanceof Error ? err.message : err, id });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Fetch all dropdown lists (for select dropdowns) - unpaginated
export async function getAllDropdownLists(): Promise<{ success: boolean; data?: DropdownList[]; message?: string }> {
  const log = logger.child('lib/dropdown-list-requests/getAllDropdownLists');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    // Fetch all pages - get first page to see total pages
    let allData: DropdownList[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '100', // Get 100 per page to minimize requests
      });
      
      const response = await fetch(`${BASE_URL}/dropdown-list?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
        next: { revalidate: 0 },
      });
      
      if (!response.ok) {
        const msg = `HTTP error: ${response.status}`;
        log.error('Error fetching dropdown lists', { error: msg });
        return { success: false, message: msg };
      }
      
      const data: DropdownListListResponse = await response.json();
      if (!data.success) {
        return { success: false, message: 'Failed to fetch dropdown lists' };
      }
      
      if (data.data && data.data.length > 0) {
        allData = [...allData, ...data.data];
      }
      
      // Check if there are more pages
      if (data.pagination && page >= data.pagination.last_page) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    return { success: true, data: allData };
  } catch (err) {
    log.error('Error fetching all dropdown lists', {
      error: err instanceof Error ? err.message : err,
    });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}


