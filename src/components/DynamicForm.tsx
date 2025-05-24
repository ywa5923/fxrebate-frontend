"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import Multiselect from 'react-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"


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
  min?: number
  max?: number
  step?: number
  tooltip?: string
  meta_data?: { value: string; label: string }[]
}

interface DynamicFormProps {
  fields: FormField[]
  onSubmit: (data: any) => void
}

export function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  
  // Create a dynamic schema based on the fields
  const schemaObject: { [key: string]: any } = {}
  for (const field of fields) {


    if (field.data_type === "numberWithUnit") {
      schemaObject[field.slug] = field.required === 1
        ? z.object({
            value: z.number(),
            unit: z.string(),
          })
        : z.object({
            value: z.number().optional(),
            unit: z.string().optional(),
          }).optional();
      continue;
    }

    let fieldSchema;
    switch (field.data_type) {
      case "text":
        fieldSchema = z.string()
        break
      case "number":
        fieldSchema = z.number()
        break
      case "boolean":
        fieldSchema = z.boolean()
        break
      case "date":
        fieldSchema = z.date()
        break
      case "string":
        fieldSchema = z.string()
        
        break
      case "array":
       // Use string validation with pipe delimiter format
       // Create the array schema
      fieldSchema = z.array(z.string());
       // Apply validation immediately if required
      if (field.required === 1) {
          fieldSchema = fieldSchema.min(1, `Please select at least one ${field.name}`);
        } 
        break;
      default:
        fieldSchema = z.string()
    }
    
    // Add validation based on field properties
    if (field.required == 1) {
      if (field.data_type === "text" || field.data_type === "select") {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
      } else if (field.data_type === "number") {
        fieldSchema = (fieldSchema as z.ZodNumber).min(1, `${field.name} is required`);
      }else if (field.form_type === "select") {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
      }
    }
    
    if (field.data_type === "number") {
      if (field.min !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).min(field.min);
      if (field.max !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).max(field.max);
    }

    schemaObject[field.slug] = fieldSchema
  }

  const formSchema = z.object(schemaObject)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => {
      switch (field.data_type) {
        case "boolean":
          return { ...acc, [field.slug]: false }
        case "array":
          return { ...acc, [field.slug]: [] }
        case "date":
          return { ...acc, [field.slug]: null }
        case "numberWithUnit":
          return { ...acc, [field.slug]: { value: undefined, unit: undefined } }
        default:
          return { ...acc, [field.slug]: "" }
      }
    }, {}),
  })

  function handleSubmit(data: z.infer<typeof formSchema>) {
  
    console.log("Form data submitted:", data);
    
   
    onSubmit(data);
  }

  const renderFormField = (field: FormField, formField: any) => {
    switch (field.form_type) {
      case "numberWithUnit":
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
              min={field.min}
              max={field.max}
              step={field.step}
              value={formField.value?.value || ''}
              onChange={(e) => formField.onChange({ ...formField.value, value: parseFloat(e.target.value) })}
            />
            <Select
              value={formField.value?.unit || ''}
              onValueChange={(unit) => formField.onChange({ ...formField.value, unit })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {field.meta_data?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
            {...formField}
          />
        )
      case "select":
        return (
          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.meta_data && Array.isArray(field.meta_data) && field.meta_data.map((option:any) => (
             
               
               <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "multiselect":
        return (
          <Multiselect
            options={field.meta_data}
            isMulti
            classNamePrefix="react-select"
            onChange={(selected) => {
              // Store the actual array of selected values
              const values = selected ? selected.map((option: { value: string }) => option.value) : [];
              formField.onChange(values);
              
              // Trigger validation after selection changes
             // setTimeout(() => form.trigger(field.slug), 100);
            }}
            value={field.meta_data?.filter(option => 
              Array.isArray(formField.value) && formField.value.includes(option.value)
            ) || []}
            placeholder={field.placeholder || `Select ${field.name.toLowerCase()}`}
          
            name={field.name}
            id={field.slug}
          />
        )
      case "checkbox":
        return (
          <Checkbox
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        )
      case "radio":
        return (
          <RadioGroup onValueChange={formField.onChange} defaultValue={formField.value}>
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.slug}-${option.value}`} />
                <label htmlFor={`${field.slug}-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </RadioGroup>
        )
      case "switch":
        return (
          <Switch
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formField.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formField.value ? format(formField.value, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formField.value}
                onSelect={formField.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      default:
        return (
          <Input
            type={field.data_type === "number" ? "number" : "text"}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
            min={field.min}
            max={field.max}
            step={field.step}
            {...formField}
          />
        )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {fields.map((field) => (
          <FormField
            key={field.id}
            control={form.control}
            name={field.slug}
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>{field.name}</FormLabel>
                  {field.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{field.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FormControl>
                  {renderFormField(field, formField)}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

