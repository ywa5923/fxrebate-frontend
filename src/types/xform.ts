export type fieldValidation = {
    min?: number;
    max?: number;
    positive?: boolean;
    negative?: boolean;
    email?: boolean;
    positive_message?: string;
    negative_message?: string;
    required?: boolean;
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
    min_message?: string;
    max_message?: string;
    gt_message?: string;
    lt_message?: string;
    gte_message?: string;
    lte_message?: string;
    email_message?: string;
  };
  
export interface XFormField {
    type: string;
    valueType?: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: XFormOption[];
    searchUrl?: string;
    searchParamName?: string;
    debounceMs?: number;
    validation?: fieldValidation;
    fields?: Record<string, Omit<XFormField, 'fields'>>;//this is for array fields
  }

  export interface XFormSection {
    label?: string;
    fields: Record<string, XFormField>;
    description?: string;
  }

  export interface XFormDefinition {
    name?: string;
    description?: string;
    sections: Record<string, XFormSection>;
  }
  export interface XFormOption {
    value: string|number;
    label: string;
  }
