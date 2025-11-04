'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { BASE_URL } from '@/constants';
import type { DynamicOptionListResponse, DynamicOptionFilters, DynamicOptionApiResponse, DynamicOption, OptionCategory, OptionCategoryListResponse, FormMetaData, FormMetaDataResponse, DynamicOptionForm } from '@/types/DynamicOption';

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

    const rawData: DynamicOptionApiResponse = await response.json();

    if (!rawData.success) {
      throw new Error('Failed to fetch dynamic option list');
    }

    // API returns flat structure: { success, data, table_columns, pagination }
    const data: DynamicOptionListResponse = {
      success: rawData.success,
      data: rawData.data || [],
      table_columns: rawData.table_columns,
      pagination: rawData.pagination,
    };

    return data;
  } catch (err) {
    log.error('Error fetching dynamic option list', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

// Types moved to '@/types/DynamicOption'

export async function getOptionCategories(): Promise<OptionCategoryListResponse> {
  const log = logger.child('lib/dynamic-option-requests/getOptionCategories');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(
      `${BASE_URL}/option-categories/get-list`,
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
      log.error('Error fetching option categories', { error: msg });
      throw new Error(msg);
    }

    const rawData = await response.json();

    if (!rawData.success) {
      throw new Error('Failed to fetch option categories');
    }

    // Extract only id and name from each category
    const categories: OptionCategory[] = (rawData.data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));

    return {
      success: true,
      data: categories,
    };
  } catch (err) {
    log.error('Error fetching option categories', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

// Types moved to '@/types/DynamicOption'

export async function getFormMetaData(): Promise<FormMetaDataResponse> {
  const log = logger.child('lib/dynamic-option-requests/getFormMetaData');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(
      `${BASE_URL}/broker-options/form-meta-data`,
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
      log.error('Error fetching form metadata', { error: msg });
      throw new Error(msg);
    }

    const rawData = await response.json();

    if (!rawData.success) {
      throw new Error('Failed to fetch form metadata');
    }

    return {
      success: true,
      data: rawData.data,
    };
  } catch (err) {
    log.error('Error fetching form metadata', { 
      error: err instanceof Error ? err.message : err 
    });
    throw err;
  }
}

export async function getDynamicOption(id: number): Promise<{ success: boolean; data?: DynamicOption; message?: string }> {
  const log = logger.child('lib/dynamic-option-requests/getDynamicOption');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/broker-options/${id}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    });
    
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error fetching dynamic option', { status: response.status, message, id, data });
      return { success: false, message };
    }
    
    // Handle different response shapes - the API might return data directly or wrapped in { success, data }
   
    if (data.success ) {
      let dynamicOption: DynamicOption=data.data
     
      return { success: true, data: dynamicOption };
    } else {
      log.error('Unexpected response shape for dynamic option', { data });
      return { success: false, message: 'Unexpected response shape' };
    }
    
    
  } catch (err) {
    log.error('Error fetching dynamic option', { error: err instanceof Error ? err.message : err, id });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createDynamicOption(
  input: DynamicOptionForm
): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dynamic-option-requests/createDynamicOption');
  
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/broker-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
      body: JSON.stringify(input),
    });
    
    let data: any = {};
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (e) {
      log.error('Failed to parse response', { error: e });
    }
    
    if (!response.ok) {
      // Handle validation errors
      let message = data?.message || `HTTP error: ${response.status}`;
      
      // If there are validation errors, append them to the message
      if (data?.errors) {
        const validationErrors = Object.entries(data.errors)
          .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        message += ` - ${validationErrors}`;
      }
      
      log.error('Error creating dynamic option', { 
        status: response.status, 
        message,
        errors: data?.errors,
        data: data
      });
      return { success: false, message };
    }
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error creating dynamic option', { error: err instanceof Error ? err.message : err });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateDynamicOption(
  id: number,
  input: DynamicOptionForm
): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dynamic-option-requests/updateDynamicOption');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    
    const url = `${BASE_URL}/broker-options/${id}`;
    log.debug('Updating dynamic option', { id, url, input });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${bearerToken}` 
      },
      body: JSON.stringify(input),
    });
    
    let data: any = {};
    let responseText = '';
    try {
      responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      log.error('Failed to parse response', { error: e, responseText });
    }
    
    if (!response.ok) {
      // Handle validation errors
      let message = data?.message || `HTTP error: ${response.status}`;
      
      // If there are validation errors, append them to the message
      if (data?.errors) {
        const validationErrors = Object.entries(data.errors)
          .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        message += ` - ${validationErrors}`;
      }
      
      log.error('Error updating dynamic option', { 
        status: response.status, 
        statusText: response.statusText,
        message,
        errors: data?.errors,
        data: data,
        id,
        url,
        requestBody: input
      });
      return { success: false, message };
    }
    
    //log.debug('Dynamic option updated successfully', { id, data });
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error updating dynamic option', { 
      error: err instanceof Error ? err.message : err, 
      id,
      stack: err instanceof Error ? err.stack : undefined
    });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteDynamicOption(id: number): Promise<{ success: boolean; message?: string }> {
  const log = logger.child('lib/dynamic-option-requests/deleteDynamicOption');
  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      return { success: false, message: 'Authentication token not found' };
    }
    const response = await fetch(`${BASE_URL}/broker-options/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || `HTTP error: ${response.status}`;
      log.error('Error deleting dynamic option', { status: response.status, message, id });
      return { success: false, message };
    }
    return { success: true, message: data?.message };
  } catch (err) {
    log.error('Error deleting dynamic option', { error: err instanceof Error ? err.message : err, id });
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

