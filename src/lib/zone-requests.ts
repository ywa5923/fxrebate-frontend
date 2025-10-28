'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { revalidatePath } from 'next/cache';
import { BASE_URL } from '@/constants';
import { zoneSchema } from '@/app/schemas/zone-schema';
import type { 
  Zone, 
  ZoneListResponse, 
  ZoneFilters, 
  CreateZoneData, 
  CreateZoneResponse, 
  ZoneResponse, 
  DeleteZoneResponse, 
  UpdateZoneData 
} from '@/types';

export async function getZoneList(
  page: number = 1,
  perPage: number = 25,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  filters?: ZoneFilters
): Promise<ZoneListResponse> {

  const log = logger.child('lib/zone-requests/getZoneList');
  
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
    if (filters?.name) {
      params.set('name', filters.name);
    }
    if (filters?.zone_code) {
      params.set('zone_code', filters.zone_code);
    }

    const response = await fetch(
      `${BASE_URL}/zones?${params.toString()}`,
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
      log.error('Error fetching zone list', { error: msg });
      throw new Error(msg);
    }

    const data: ZoneListResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch zone list');
    }

    

    return data;
  } catch (err) {
    log.error('Error fetching zone list', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

export async function createZone(zoneData: CreateZoneData): Promise<CreateZoneResponse> {
  const log = logger.child('lib/zone-requests/createZone');
  
  try {
    // Validate input data with Zod
    const validationResult = zoneSchema.safeParse(zoneData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      log.error('Validation failed', { errors: validationResult.error.errors });
      return {
        success: false,
        message: `Validation failed: ${errors}`,
      };
    }

    let bearerToken: string | null = null;
    
    try {
      bearerToken = await getBearerToken();
    } catch (tokenError) {
      log.error('Error getting bearer token', {
        error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      });
      return {
        success: false,
        message: 'Authentication error. Please log in again.',
      };
    }
    
    if (!bearerToken) {
      log.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found',
      };
    }

    const validatedData = validationResult.data;
    log.debug('Creating zone', { zoneData: validatedData });

    const response = await fetch(`${BASE_URL}/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        name: validatedData.name,
        zone_code: validatedData.zone_code,
        description: validatedData.description || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error creating zone', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    log.debug('Zone created successfully', { zoneId: data.data?.id });

    // Revalidate the zones list page
    revalidatePath('/en/control-panel/super-manager/zones');

    return {
      success: true,
      message: data.message || 'Zone created successfully',
      data: data.data,
    };
  } catch (err) {
    log.error('Error creating zone', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function getZone(zoneId: number): Promise<ZoneResponse> {
  const log = logger.child('lib/zone-requests/getZone');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      log.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found',
      };
    }

    log.debug('Fetching zone', { zoneId });

    const response = await fetch(`${BASE_URL}/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error fetching zone', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    log.debug('Zone fetched successfully', { zoneId });

    return {
      success: true,
      data: data.data,
    };
  } catch (err) {
    log.error('Error fetching zone', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function updateZone(zoneId: number, zoneData: UpdateZoneData): Promise<CreateZoneResponse> {
  const log = logger.child('lib/zone-requests/updateZone');
  
  try {
    // Validate input data with Zod
    const validationResult = zoneSchema.safeParse(zoneData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      log.error('Validation failed', { errors: validationResult.error.errors });
      return {
        success: false,
        message: `Validation failed: ${errors}`,
      };
    }

    const bearerToken = await getBearerToken();
    
    if (!bearerToken) {
      log.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const validatedData = validationResult.data;
    const updateUrl = `${BASE_URL}/zones/${zoneId}`;
    
   
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        name: validatedData.name,
        zone_code: validatedData.zone_code,
        description: validatedData.description || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error updating zone', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    // Revalidate the zones list page
    revalidatePath('/en/control-panel/super-manager/zones');

    return {
      success: true,
      message: data.message || 'Zone updated successfully',
      data: data.data,
    };
  } catch (err) {
    log.error('Error updating zone', { 
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function deleteZone(zoneId: number): Promise<DeleteZoneResponse> {
  const log = logger.child('lib/zone-requests/deleteZone');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      log.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found',
      };
    }

    log.debug('Deleting zone', { zoneId });

    const response = await fetch(`${BASE_URL}/zones/${zoneId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error deleting zone', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    log.debug('Zone deleted successfully', { zoneId });

    // Revalidate the zones list page
    revalidatePath('/en/control-panel/super-manager/zones');

    return {
      success: true,
      message: data.message || 'Zone deleted successfully',
    };
  } catch (err) {
    log.error('Error deleting zone', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

