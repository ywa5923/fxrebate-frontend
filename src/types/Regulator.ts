export interface Regulator {
  id: number;
  name: string;
  acronym: string;
  country: string;
  country_code: string;
  zone: string | null;
  tier_classification: string | null;
  rating: string | null;
  investor_protection_scheme: string | null;
  compensation_scheme: string | null;
  retail_leverage_restrictions: string | null;
  website: string | null;
  year_established: number | null;
  jurisdiction_type: string | null;
  notes: string | null;
  description: string | null;
  status?: string | null;
  status_reason?: string | null;
  is_invariant: boolean;
  zone_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}


export type RegulatorListItem = {
  id: number;
  name: string;
}

export type RegulatorList = RegulatorListItem[];