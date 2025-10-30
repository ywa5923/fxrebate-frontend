'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { revalidatePath } from 'next/cache';
import { BASE_URL } from '@/constants';
import { countrySchema } from '@/app/schemas/country-schema';
import type { 
  CountryListResponse, 
  CountryFilters,
  CreateCountryData,
  CreateCountryResponse,
  UpdateCountryData,
  UpdateCountryResponse,
  CountryResponse
} from '@/types/Country';

export async function getCountryList(
  page: number = 1,
  perPage: number = 25,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  filters?: CountryFilters
): Promise<CountryListResponse> {

  const log = logger.child('lib/country-requests/getCountryList');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    // Note: Check if countries API supports sorting
    // If it doesn't, these parameters might cause the API to return success: false
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
    if (filters?.country_code) {
      params.set('country_code', filters.country_code);
    }
    if (filters?.zone_code) {
      params.set('zone_code', filters.zone_code);
    }

    const url = `${BASE_URL}/countries?${params.toString()}`;
    log.debug('Fetching countries', { 
      url, 
      params: params.toString(),
      orderBy,
      orderDirection 
    });

    const response = await fetch(
      url,
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
      log.error('Error fetching country list', { 
        status: response.status,
        error: response.statusText
      });
      throw new Error(response.statusText);
    }

    

    const data: CountryListResponse = await response.json();

    if (!data.success) {
      log.error('API returned success: false', { 
        data,
        url 
      });
      throw new Error('Failed to fetch country list');
    }

    log.debug('Countries fetched successfully', { 
      count: data.data?.length,
      total: data.pagination?.total 
    });

    return data;
  } catch (err) {
    log.error('Error fetching country list', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

export async function createCountry(countryData: CreateCountryData): Promise<CreateCountryResponse> {
  const log = logger.child('lib/country-requests/createCountry');
  
  try {
    // Validate input data with Zod
    const validationResult = countrySchema.safeParse(countryData);
    
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
    log.debug('Creating country', { countryData: validatedData });

    const response = await fetch(`${BASE_URL}/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        name: validatedData.name,
        country_code: validatedData.country_code,
        zone_id: validatedData.zone_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error creating country', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    log.debug('Country created successfully', { countryId: data.data?.id });

    // Revalidate the countries list page
    revalidatePath('/en/control-panel/super-manager/countries');

    return {
      success: true,
      message: data.message || 'Country created successfully',
      data: data.data,
    };
  } catch (err) {
    log.error('Error creating country', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function getCountryById(countryId: number): Promise<CountryResponse> {
  const log = logger.child('lib/country-requests/getCountryById');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      log.error('Authentication token not found');
      throw new Error('Authentication token not found');
    }

    log.debug('Fetching country', { countryId });

    const response = await fetch(`${BASE_URL}/countries/${countryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      let errorMessage = `HTTP error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        log.error('Error fetching country', { 
          status: response.status,
          error: errorMessage,
          errorData 
        });
      } catch {
        const errorText = await response.text();
        log.error('Error fetching country', { 
          status: response.status,
          error: errorMessage,
          errorText 
        });
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      log.error('Non-JSON response received', { contentType, text });
      throw new Error('Invalid response format from server');
    }

    const data: CountryResponse = await response.json();

    if (!data.success) {
      log.error('API returned success: false', { 
        data,
        countryId 
      });
      throw new Error('Failed to fetch country');
    }

    log.debug('Country fetched successfully', { countryId });
    return data;
  } catch (err) {
    log.error('Error fetching country', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

export async function updateCountry(
  countryId: number,
  countryData: UpdateCountryData
): Promise<UpdateCountryResponse> {
  const log = logger.child('lib/country-requests/updateCountry');
  
  try {
    // Validate input data with Zod
    const validationResult = countrySchema.safeParse(countryData);
    
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
    log.debug('Updating country', { countryId, countryData: validatedData });

    const response = await fetch(`${BASE_URL}/countries/${countryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        name: validatedData.name,
        country_code: validatedData.country_code,
        zone_id: validatedData.zone_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log.error('Error updating country', { 
        status: response.status,
        message: data.message 
      });
      return {
        success: false,
        message: data.message || `HTTP error: ${response.status}`,
      };
    }

    log.debug('Country updated successfully', { countryId, data: data.data?.id });

    // Revalidate the countries list page
    revalidatePath('/en/control-panel/super-manager/countries');

    return {
      success: true,
      message: data.message || 'Country updated successfully',
      data: data.data,
    };
  } catch (err) {
    log.error('Error updating country', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function deleteCountry(countryId: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/country-requests/deleteCountry');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      log.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found',
      };
    }

    log.debug('Deleting country', { countryId });

    const response = await fetch(`${BASE_URL}/countries/${countryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    let message = `HTTP error: ${response.status}`;
    let data: any = null;
    try {
      data = await response.json();
      if (data?.message) message = data.message;
    } catch {}

    if (!response.ok) {
      log.error('Error deleting country', { status: response.status, message, data });
      return { success: false, message };
    }

    // Revalidate countries list page
    revalidatePath('/en/control-panel/super-manager/countries');

    log.debug('Country deleted successfully', { countryId });
    return { success: true, message: data?.message || 'Country deleted successfully' };
  } catch (err) {
    log.error('Error deleting country', { 
      error: err instanceof Error ? err.message : err 
    });
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

