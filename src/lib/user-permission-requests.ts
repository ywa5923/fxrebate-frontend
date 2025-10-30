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

export interface CreateUserPermissionPayload {
  subject_type: string;
  subject_id: number;
  permission_type: 'broker' | 'country' | 'zone' | 'seo-country' | 'translator-country';
  resource_id?: number | null;
  resource_value?: string | null;
  action: 'view' | 'edit' | 'delete' | 'manage';
  metadata?: Record<string, unknown> | unknown[] | null;
  is_active?: boolean;
}

export async function createUserPermission(payload: CreateUserPermissionPayload): Promise<{ success: boolean; message?: string; data?: any }> {
  const log = logger.child('lib/user-permission-requests/createUserPermission');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };

   
    const response = await fetch(`${BASE_URL}/user-permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error creating permission', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Permission created successfully', data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function getUserPermissionById(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  const log = logger.child('lib/user-permission-requests/getUserPermissionById');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/user-permissions/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      next: { revalidate: 0 },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error fetching permission by id', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

export async function updateUserPermission(id: number, payload: CreateUserPermissionPayload): Promise<{ success: boolean; message?: string; data?: any }> {
  const log = logger.child('lib/user-permission-requests/updateUserPermission');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) return { success: false, message: 'Authentication token not found' };
    const response = await fetch(`${BASE_URL}/user-permissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      log.error('Error updating permission', { status: response.status, message: data?.message });
      return { success: false, message: data?.message || `HTTP error: ${response.status}` };
    }
    return { success: true, message: data?.message || 'Permission updated successfully', data: data?.data };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}


