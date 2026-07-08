export interface ChallengeMatrixHeadear {
  id: number;
  type: string;
  title: string;
  slug: string;
  group_name: string | null;
  order: number;
  description: string | null;
  is_percentage: boolean;
  percentage_value: number | null;
  info_section_key: string | null;
  info_section_layout: string | null;
  broker_can_see: boolean;
  created_at: string | null;
  updated_at: string | null;
}
