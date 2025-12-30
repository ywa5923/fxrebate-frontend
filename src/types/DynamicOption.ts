
// Common fields shared by server model and form payload
export interface BaseDynamicOption {
  name: string;
  slug: string;
  applicable_for: string | null;
  data_type: string;
  form_type: string;
  for_crypto: number | boolean;
  for_brokers: number | boolean;
  for_props: number | boolean;
  required: number | boolean;
  // shared optional fields
  meta_data?: string | null;
  placeholder?: string | null;
  tooltip?: string | null;
  min_constraint?: number | string | null;
  max_constraint?: number | string | null;
  load_in_dropdown?: boolean | number | null;
  dropdown_position?: number | null;
  default_loading?: boolean | number | null;
  default_loading_position?: number | null;
  position_in_category?: number | null;
  is_active?: number | boolean | null;
  allow_sorting?: number | boolean | null;
}

export interface DynamicOption extends BaseDynamicOption {
  id: number;
  // inherits shared fields from BaseDynamicOption
  category_name: string | null;
  dropdown_list_attached: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Payload used by create/update dynamic option APIs
export interface DynamicOptionForm extends BaseDynamicOption {
  category_name?: number | null;
  dropdown_list_attached?: number | null;
}



