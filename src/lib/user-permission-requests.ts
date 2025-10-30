'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { BASE_URL } from '@/constants';
import type { UserPermissionListResponse, UserPermissionFilters } from '@/types/UserPermission';

export async function getUserPermissionList(
  page: number = 1,
  perPage: number = 15,
  filters?: UserPermissionFilters
): Promise<UserPermissionListResponse> {
  const log = logger.child('lib/user-permission-requests/getUserPermissionList');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) throw new Error('Authentication token not found');

    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (filters?.subject_type) params.set('subject_type', filters.subject_type);
    if (filters?.subject_id) params.set('subject_id', filters.subject_id);
    if (filters?.permission_type) params.set('permission_type', filters.permission_type);
    if (filters?.resource_id) params.set('resource_id', filters.resource_id);
    if (filters?.resource_value) params.set('resource_value', filters.resource_value);
    if (filters?.action) params.set('action', filters.action);
    if (filters?.subject) params.set('subject', filters.subject);
    if (filters?.is_active) params.set('is_active', filters.is_active);
    if (filters?.order_by) params.set('order_by', filters.order_by);
    if (filters?.order_direction) params.set('order_direction', filters.order_direction);

    const response = await fetch(`${BASE_URL}/user-permissions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      let msg = `HTTP error: ${response.status}`;
      try { const data = await response.json(); msg = data?.message || msg; } catch {}
      log.error('Failed fetching permissions', { status: response.status, msg });
      throw new Error(msg);
    }

    const data: UserPermissionListResponse = await response.json();
    if (!data.success) throw new Error('Failed to fetch permissions');
    return data;
  } catch (err) {
    log.error('Exception fetching permissions', { error: err instanceof Error ? err.message : err });
    throw err;
  }
}

export async function deleteUserPermission(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/user-permission-requests/deleteUserPermission');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/user-permissions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
    });
    let data: any = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      log.error('Error deleting permission', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Permission deleted successfully' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function toggleUserPermission(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/user-permission-requests/toggleUserPermission');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/user-permissions/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
    });
    let data: any = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      log.error('Error toggling permission', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Permission toggled successfully' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}


