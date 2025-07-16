export interface OptionValue {
  id?: number;
  option_slug: string;
  value: string;
  public_value: string | null;
  status?: boolean;
  status_message?: string | null;
  default_loading?: boolean;
  type?: string | null;
  is_invariant?: boolean;
  delete_by_system?: boolean;
  broker_id?: number;
  broker_option_id?: number;
  zone_id?: number | null;
  metadata?: (Record<string, any> & { unit?: string }) | null;
  isNumberWithUnit?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

