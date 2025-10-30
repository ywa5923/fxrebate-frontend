export interface Zone {
  id: number;
  name: string;
  zone_code: string;
}

export interface Country {
  id: number;
  name: string;
  country_code: string;
  zone_name: string;
  zone_code: string;
  zone: Zone;
  brokers_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CountryPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface CountryListResponse {
  success: boolean;
  data: Country[];
  pagination: CountryPagination;
}

export interface CountryFilters {
  name?: string;
  country_code?: string;
  zone_code?: string;
}

export interface CreateCountryData {
  name: string;
  country_code: string;
  zone_id: number;
}

export interface CreateCountryResponse {
  success: boolean;
  message?: string;
  data?: Country;
}

export interface UpdateCountryData {
  name: string;
  country_code: string;
  zone_id: number;
}

export interface UpdateCountryResponse {
  success: boolean;
  message?: string;
  data?: Country;
}

export interface CountryResponse {
  success: boolean;
  data?: Country;
  message?: string;
}

