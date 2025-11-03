'use server';

import { getBearerToken } from './auth-actions';
import logger from './logger';
import { BASE_URL } from '@/constants';
import type { DynamicOptionListResponse, DynamicOptionFilters, DynamicOptionApiResponse } from '@/types/DynamicOption';

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

export interface CreateDynamicOptionInput {
  name: string;
  slug: string;
  applicable_for: string;
  data_type: string;
  form_type: string;
  meta_data?: string | null;
  for_crypto: boolean | number;
  for_brokers: boolean | number;
  for_props: boolean | number;
  required: boolean | number;
  placeholder?: string | null;
  tooltip?: string | null;
  min_constraint?: string | null;
  max_constraint?: string | null;
  load_in_dropdown?: boolean | number | null;
  default_loading?: boolean | number | null;
  default_loading_position?: number | null;
  dropdown_position?: number | null;
  position_in_category?: number | null;
  is_active?: boolean | number | null;
  allow_sorting?: boolean | number | null;
  category_name?: number | null;
  dropdown_list_attached?: number | null;
}

export interface OptionCategory {
  id: number;
  name: string;
}

export interface OptionCategoryListResponse {
  success: boolean;
  data: OptionCategory[];
}

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

export interface FormMetaData {
  applicable_for: string[];
  data_type: string[];
  form_type: string[];
}

export interface FormMetaDataResponse {
  success: boolean;
  data: FormMetaData;
}

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

export async function createDynamicOption(
  input: CreateDynamicOptionInput
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

