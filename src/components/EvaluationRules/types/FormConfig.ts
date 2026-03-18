export interface EvaluationFieldOption {
  value: number;
  label: string;
  is_getter: 0 | 1;
  description: string;
}

export interface EvaluationFieldValidation {
  required: boolean;
  exists: string;
}

export interface SelectFieldConfig {
  type: "select";
  label: string;
  options: EvaluationFieldOption[];
  required: boolean;
  validation: EvaluationFieldValidation;
}


export type EvaluationFields = Record<string, SelectFieldConfig>;

export interface EvaluationSection {
  label: string;
  fields: EvaluationFields;
}

export type EvaluationFormSections = Record<string, EvaluationSection>;



export interface EvaluationFormConfig {
  name: string;
  description: string;
  sections: EvaluationFormSections;
}
