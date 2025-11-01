export interface DynamicOption {
  [key: string]: any; // Since keys are dynamic (slug-based)
  slug: string;
  name: string;
  category_name?: string;
  dropdown_category_name?: string;
  applicable_for?: string;
  data_type?: string;
  form_type?: string;
  for_brokers?: number | boolean;
  for_crypto?: number | boolean;
  for_props?: number | boolean;
  required?: number | boolean;
  default_loading?: number | boolean | null;
  default_loading_position?: number;
  dropdown_position?: number;
  load_in_dropdown?: number | boolean;
  allow_sorting?: number | boolean;
  tooltip?: string | null;
  placeholder?: string | null;
}

export interface DynamicOptionPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface DynamicOptionListResponse {
  success: boolean;
  data: DynamicOption[];
  pagination: DynamicOptionPagination;
}

export interface DynamicOptionFilters {
  category_name?: string;
  dropdown_category_name?: string;
  name?: string;
  applicable_for?: string;
  data_type?: string;
  form_type?: string;
  for_brokers?: string;
  for_crypto?: string;
  for_props?: string;
  required?: string;
}

