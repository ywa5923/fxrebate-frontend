
export interface Zone {
  id: number;
  name: string;
  zone_code: string;
  description: string;
  countries: string;
  countries_count: number;
  brokers_count:number;
  created_at: string | null;
  updated_at?: string | null;
}


// import type { Zone, ZoneFormData } from '@/app/schemas/zone-schema';

// export type { Zone, ZoneFormData };

// export interface ZonePagination {
//   current_page: number;
//   last_page: number;
//   per_page: number;
//   total: number;
//   from: number;
//   to: number;
// }

// export interface ZoneListResponse {
//   success: boolean;
//   data: Zone[];
//   pagination: ZonePagination;
// }

// export interface ZoneFilters {
//   name?: string;
//   zone_code?: string;
// }

// export interface CreateZoneData {
//   name: string;
//   zone_code: string;
//   description?: string | null;
// }

// export interface CreateZoneResponse {
//   success: boolean;
//   message?: string;
//   data?: Zone;
// }

// export interface ZoneResponse {
//   success: boolean;
//   message?: string;
//   data?: Zone;
// }

// export interface DeleteZoneResponse {
//   success: boolean;
//   message?: string;
// }

// export interface UpdateZoneData {
//   name: string;
//   zone_code: string;
//   description?: string | null;
// }
