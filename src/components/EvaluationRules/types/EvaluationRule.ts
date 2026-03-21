/** Row returned by evaluation-rules API for a broker. */
export interface EvaluationRule {
  id: number;
  broker_id: number;
  zone_id: number | null;
  evaluation_rule_id: number;
  evaluation_option_id: number;
  public_evaluation_option_id: number | null;
  details: string | null;
  public_details: string | null;
  previous_evaluation_option_id: number | null;
  previous_evaluation_option_value: string | null;
  previous_details: string | null;
  evaluation_rule_slug: string;
  evaluation_option_value: string;
  is_getter: 0 | 1;
  is_updated_entry: 0 | 1;
  created_at: string | null;
  updated_at: string | null;
}
