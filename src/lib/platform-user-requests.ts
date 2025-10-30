'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { BASE_URL } from '@/constants';
import type { PlatformUserListResponse } from '@/types/PlatformUser';
import { platformUserSchema } from '@/app/schemas/platform-user-schema';

export interface PlatformUserFilters {
  name?: string;
  email?: string;
  role?: string;
  is_active?: '1' | '0' | string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export async function getPlatformUserList(
  page: number = 1,
  perPage: number = 15,
  filters?: PlatformUserFilters
): Promise<PlatformUserListResponse> {
  const log = logger.child('lib/platform-user-requests/getPlatformUserList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (filters?.name) params.set('name', filters.name);
    if (filters?.email) params.set('email', filters.email);
    if (filters?.role) params.set('role', filters.role);
    if (filters?.is_active) params.set('is_active', filters.is_active);
    if (filters?.order_by) params.set('order_by', filters.order_by);
    if (filters?.order_direction) params.set('order_direction', filters.order_direction);

   
    const response = await fetch(`${BASE_URL}/platform-users?${params.toString()}`, {
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
        errorMessage = errorData.message || errorMessage;
      } catch {}
      log.error('Error fetching platform users', { status: response.status, error: errorMessage });
      throw new Error(errorMessage);
    }

    const data: PlatformUserListResponse = await response.json();
    if (!data.success) {
      log.error('API returned success: false', { data });
      throw new Error('Failed to fetch platform users');
    }
    return data;
  } catch (err) {
    log.error('Exception fetching platform users', { error: err instanceof Error ? err.message : err });
    throw err;
  }
}

export async function createPlatformUser(payload: any): Promise<{ success: boolean; message?: string; data?: any }> {
  const log = logger.child('lib/platform-user-requests/createPlatformUser');
  try {
    const validation = platformUserSchema.safeParse(payload);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, message: `Validation failed: ${errors}` };
    }
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/platform-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify(validation.data),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error creating platform user', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Platform user created successfully', data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function getPlatformUserById(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) throw new Error('Authentication token not found');
    const response = await fetch(`${BASE_URL}/platform-users/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    const data = await response.json();
    return { success: true, data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function updatePlatformUser(id: number, payload: any): Promise<{ success: boolean; message?: string; data?: any }> {
  const log = logger.child('lib/platform-user-requests/updatePlatformUser');
  try {
    const validation = platformUserSchema.safeParse(payload);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, message: `Validation failed: ${errors}` };
    }
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/platform-users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify(validation.data),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error updating platform user', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Platform user updated successfully', data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function togglePlatformUser(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/platform-user-requests/togglePlatformUser');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/platform-users/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });
    let data: any = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      log.error('Error toggling platform user', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Platform user status toggled' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function deletePlatformUser(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/platform-user-requests/deletePlatformUser');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/platform-users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
    });
    let data: any = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      log.error('Error deleting platform user', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Platform user deleted successfully' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}


