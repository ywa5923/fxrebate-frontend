export interface EvaluationOption {
  id: number;
  option_label: string;
  option_value: string;
  description: string | null;
  placeholder: string | null;
  is_getter: "0" | "1";
  getter_type: string | null;
}

export interface EvaluationRule {
  id: number;
  label: string;
  slug: string;
  order: number;
  is_active: "0" | "1";
  required: "0" | "1";
  visible_for_user: "0" | "1";
  options?: EvaluationOption[];
  options_number?: number;
  created_at: string;
  updated_at: string;
}
