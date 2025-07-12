"use client"

import { DynamicForm } from "@/components/DynamicForm"

interface FormField {
  id: number
  slug: string
  name: string
  data_type: string
  form_type: string
  options?: { value: string; label: string }[]
  required?: number
  description?: string
  placeholder?: string
  tooltip?: string
}

interface BrokerProfileFormProps {
  fields: FormField[]
  onSubmit: (data: any) => Promise<any>
}

export function BrokerProfileForm({ fields, onSubmit }: BrokerProfileFormProps) {
  return <DynamicForm fields={fields} onSubmit={onSubmit} />
} 