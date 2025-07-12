export interface BrokerOption {
    id: number
    slug: string
    name: string
    data_type: string
    form_type: string
    options?: { value: string; label: string }[]
    required?: number
    description?: string
    placeholder?: string
    min?: number
    max?: number
    step?: number
    tooltip?: string
    meta_data?: { value: string; label: string }[]
  }