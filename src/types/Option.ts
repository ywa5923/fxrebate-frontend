import { OptionValue } from "./OptionValue"
import { InfoSection } from "./InfoSections"

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
    visible_for_user?: number|boolean
    info_section_layout: "vertical" | "horizontal"
    info_sections?: InfoSection[]
    meta_data?: { value: string; label: string }[]
    option_values?: OptionValue[]
  }