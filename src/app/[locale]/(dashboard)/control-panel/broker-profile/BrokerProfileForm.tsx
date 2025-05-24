"use client"

import { DynamicForm } from "@/components/DynamicForm"

interface FormField {
  id: number
  slug: string
  name: string
  data_type: string
  form_type: string
  options?: { value: string; label: string }[]
  required?: boolean
  description?: string
  placeholder?: string
  tooltip?: string
}

interface BrokerProfileFormProps {
  fields: FormField[]
  onSubmit: (data: any) => Promise<any>
}

export function BrokerProfileForm({ fields, onSubmit }: BrokerProfileFormProps) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Broker Profile</h1>
      <DynamicForm fields={fields} onSubmit={onSubmit} />
    </div>
  )
} 