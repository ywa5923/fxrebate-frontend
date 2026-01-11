import { MatrixCell } from "./Matrix";
export interface ChallengeStep {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ChallengeAmount {
  id: number;
  amount: string;
  currency: string;
}

export interface ChallengeType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  steps: ChallengeStep[];
  amounts: ChallengeAmount[];
}

export interface ChallengeTypesResponse {
  success: boolean;
  data: ChallengeType[];
}

export interface ChallengeMatrixExtraData {
  affiliateLink: AffiliateLink;
  evaluationCostDiscount: EvaluationCostDiscount;
  masterAffiliateLink: AffiliateLink;
}

export interface AffiliateLink {
  id?: number;
  url: string;
  public_url: string | null;
  previous_url: string | null;
  is_updated_entry: number; // 1 or 0
  name: string;
  slug: string;
  zone_id?: number | null;
  placeholder?: string | null;
}

export interface EvaluationCostDiscount {
  id?: number;
  public_value: string;
  value: string;
  previous_value: string;
  is_updated_entry: number; // 1 or 0
  zone_id?: number | null;
  placeholder?: string | null;
}

export interface ChalengeData extends ChallengeMatrixExtraData {
  challenge_id?: number;
  category_id: number;
  step_id: number;
  step_slug?: string;
  broker_id?: number | null;
  is_placeholder: boolean;
  amount_id?: number | null;
  zone_id?: number | null;
  is_admin?: boolean;
  matrix: MatrixCell[][];
}

export interface ChallengePlaceholders{
  matrix_placeholders_array: string[] | null;
  affiliate_master_link_placeholder: string | null;
  affiliate_link_placeholder: string | null;
  evaluation_cost_discount_placeholder: string | null;
}

