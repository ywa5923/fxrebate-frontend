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
