import { OptionValue } from "./OptionValue"

export interface Option {
    id: number
    slug: string
    name: string
    data_type: string
    form_type: string
    required?: number
    description?: string
    placeholder?: string
    min_constraint?: number
    max_constraint?: number
    tooltip?: string
    meta_data?: { value: string; label: string }[]
    option_values?: OptionValue[]
  }