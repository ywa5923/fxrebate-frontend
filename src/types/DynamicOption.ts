export interface DynamicOption {
  id: number;
  name: string;
  slug: string;
  applicable_for: string | null;
  data_type: string;
  form_type: string;
  meta_data: string | null;
  for_crypto: number | boolean;
  for_brokers: number | boolean;
  for_props: number | boolean;
  category_name: string | null;
  position_in_category: number | null;
  dropdown_list_attached: string | null;
  required: number | boolean;
  placeholder: string | null;
  tooltip: string | null;
  min_constraint: number | string | null;
  max_constraint: number | string | null;
  load_in_dropdown: number | boolean;
  dropdown_position: number | null;
  default_loading: number | boolean | null;
  default_loading_position: number | null;
  is_active: number | boolean;
  allow_sorting: number | boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface DynamicOptionPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface TableColumnConfig {
  label: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
}

export interface DynamicOptionListResponse {
  success: boolean;
  data: DynamicOption[];
  table_columns?: Record<string, TableColumnConfig>;
  pagination: DynamicOptionPagination;
}

export interface DynamicOptionApiResponse {
  success: boolean;
  data: DynamicOption[];
  table_columns?: Record<string, TableColumnConfig>;
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

