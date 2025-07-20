"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Multiselect from "react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { Option, OptionValue } from "@/types";
import { useRouter } from "next/navigation";

interface DynamicFormProps {
  broker_id: number;
  options: Option[];
  action?: (broker_id: number,formData: FormData,  is_admin: boolean,originalData?: OptionValue[],entity_id?: number,entity_type?: string) => Promise<void>;
  optionsValues: OptionValue[];
  is_admin: boolean;
  entity_id?: number;
  entity_type?: string;
}

export function DynamicForm({
  broker_id,
  options,
  action,
  optionsValues,
  is_admin,
  entity_id,
  entity_type,
}: DynamicFormProps) {
  const router = useRouter();

  // Helper function to get broker value for admin display
  const getBrokerValue = (optionSlug: string) => {
    const optionValue = optionsValues.find(optionValue => optionValue.option_slug === optionSlug);
    return optionValue?.value || "Not set";
  };
  
  // Helper function to get broker metadata for admin display
  const getBrokerMetadata = (optionSlug: string, key: string) => {
    const optionValue = optionsValues.find(optionValue => optionValue.option_slug === optionSlug);
    return optionValue?.metadata?.[key] || "Not set";
  };

  // Create a dynamic schema based on the fields
  const schemaObject: { [key: string]: any } = {};
  for (const option of options) {
    if (option.form_type === "numberWithUnit") {
      schemaObject[option.slug] =
        option.required === 1
          ? z.object({
              value: z.number(),
              unit: z.string(),
            })
          : z
              .object({
                value: z.number(),
                unit: z.string(),
              })
              .optional();
      continue;
    }

    // Handle image fields
    if (option.form_type === "image") {
      schemaObject[option.slug] =
        option.required === 1
          ? z.instanceof(File).or(z.string())
          : z.instanceof(File).or(z.string()).optional();
      continue;
    }

    let fieldSchema;
    switch (option.form_type) {
      case "text":
        fieldSchema = z.string();
        break;
      case "number":
        let numberSchema = z.number();
        if (option.min_constraint) {
          numberSchema = numberSchema.min(option.min_constraint);
        }
        if (option.max_constraint) {
          numberSchema = numberSchema.max(option.max_constraint);
        }
        fieldSchema = z.preprocess(
          (val) => (val === "" ? undefined : Number(val)),
          numberSchema
        );
        break;
      case "checkbox":
        fieldSchema = z.preprocess((val) => {
          if (val === null || val === undefined) return false;
          // if (typeof val === 'string') return val === 'true';
          return Boolean(val);
        }, z.boolean());
        break;
      case "switch":
        fieldSchema = z.preprocess((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "string") return val === "true";
          return Boolean(val);
        }, z.boolean());
        break;
      case "date":
        fieldSchema = z.date();
        break;
      case "string":
        fieldSchema = z.string();

        break;
      case "multi-select":
        // Use string validation with pipe delimiter format
        // Create the array schema
        fieldSchema = z.array(z.string());
        // Apply validation immediately if required
        if (option.required === 1) {
          fieldSchema = fieldSchema.min(
            1,
            `Please select at least one ${option.name}`
          );
        }
        break;
      default:
        fieldSchema = z.string();
    }

    // Add validation based on field properties
    // if (option.required == 1) {
    //   if (option.data_type === "text" || option.data_type === "select") {
    //     fieldSchema = (fieldSchema as z.ZodString).min(1, `${option.name} is required`);
    //   } else if (option.data_type === "number") {
    //     fieldSchema = (fieldSchema as z.ZodNumber).min(1, `${option.name} is required`);
    //   }else if (option.form_type === "select") {
    //     fieldSchema = (fieldSchema as z.ZodString).min(1, `${option.name} is required`);
    //     fieldSchema = (fieldSchema as z.ZodString).min(1, `${option.name} is required`);
    //   }
    // }

    schemaObject[option.slug] = fieldSchema;
  }

  const formSchema = z.object(schemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: options.reduce((acc, option) => {
      let optionValue = optionsValues?.find(
        (optionValue: OptionValue) => optionValue.option_slug === option.slug
      );
      if (optionValue !== null && optionValue !== undefined) {
        //if admin, populate form with public_value if it exists, otherwise use populate with optionValue.value
        let fieldValue = (is_admin)?(optionValue?.public_value === null || optionValue?.public_value === 'undefined')? optionValue?.value : optionValue?.public_value:optionValue?.value;
        switch (option.form_type) {
          case "checkbox":   
            return { ...acc, [option.slug]: fieldValue === "true" };
          case "multi-select":
            return { ...acc, [option.slug]: fieldValue?.split("; ") };

          case "numberWithUnit":
            return {
              ...acc,
              [option.slug]: {
                value: fieldValue
                  ? parseFloat(fieldValue)
                  : undefined,
                unit: optionValue?.metadata?.unit,
              },
            };
          case "image":
            return { ...acc, [option.slug]: fieldValue };
          default:
            return { ...acc, [option.slug]: fieldValue };
        }
      }
      return { ...acc, [option.slug]: null };
    }, {}),
  });

  async function handleServerActionSubmit(data: z.infer<typeof formSchema>) {
    // console.log("Server action form data from client:", data);

    // Convert to FormData for Server Action
    const formDataObj = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          // Handle file uploads
          formDataObj.append(key, value);
        } else if (Array.isArray(value)) {
          // Handle arrays by joining with semicolon
          formDataObj.append(key, value.join("; "));
        } else if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          formDataObj.append(key, JSON.stringify(value));
        } else {
          formDataObj.append(key, value);
        }
        console.log(
          "Array field:",
          key,
          value,
          Array.isArray(value),
          typeof value === "object"
        );
      }
    });

    // Call the Server Action
    if (action) {
      try {
        await action(broker_id,formDataObj, is_admin,optionsValues,entity_id,entity_type);
        toast.success("Form submitted successfully");
        // Refresh the page after successful submission using Next.js router
        router.refresh();
      } catch (error) {
        toast.error("Failed to submit form");
        console.error("Server action error:", error);
      }
    }
  }

  const renderFormField = (option: Option, formField: any) => {
    switch (option.form_type) {
      case "numberWithUnit":
        return (
          <div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={
                option.placeholder || `Enter ${option.name.toLowerCase()}`
              }
              min={option.min_constraint}
              max={option.max_constraint}
              value={formField.value?.value || ""}
              onChange={(e) =>
                formField.onChange({
                  ...formField.value,
                  value: parseFloat(e.target.value),
                })
              }
            />
            <Select
              value={formField.value?.unit || ""}
              onValueChange={(unit) =>
                formField.onChange({ ...formField.value, unit })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {option.meta_data?.map(
                  (metaData: { value: string; label: string }) => (
                    <SelectItem key={metaData?.value} value={metaData?.value}>
                      {metaData?.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            </div>
            {is_admin && <div className="text-sm text-muted-foreground mt-2">Broker value: {getBrokerValue(option.slug)}
               &nbsp;Broker unit: {getBrokerMetadata(option.slug, 'unit')}</div>}
          </div>
        );
              case "textarea":
          return (
            <div>
              <Textarea
                placeholder={
                  option.placeholder || `Enter ${option.name.toLowerCase()}`
                }
                {...formField}
                value={formField.value || ""} // Ensure value is never null
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {formField.value}
                </div>
              )}
            </div>
          );
              case "select":
          return (
            <div>
              <Select
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      option.placeholder || `Select ${option.name.toLowerCase()}`
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {option.meta_data &&
                    Array.isArray(option.meta_data) &&
                    option.meta_data.map((metaData: any) => (
                      <SelectItem key={metaData?.id} value={metaData?.value}>
                        {metaData?.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {formField.value}
                </div>
              )}
            </div>
          );
              case "multi-select":
          return (
            <div>
              <Multiselect
                options={option.meta_data}
                isMulti
                classNamePrefix="react-select"
                instanceId={option.slug} // Add stable instanceId to prevent hydration errors
                onChange={(selected) => {
                  // Store the actual array of selected values
                  const values = selected
                    ? selected.map((option: { value: string }) => option.value)
                    : [];
                  formField.onChange(values);

                  // Trigger validation after selection changes
                  // setTimeout(() => form.trigger(field.slug), 100);
                }}
                value={
                  option.meta_data?.filter(
                    (metaData) =>
                      Array.isArray(formField.value) &&
                      formField.value.includes(metaData.value)
                  ) || []
                }
                placeholder={
                  option.placeholder || `Select ${option.name.toLowerCase()}`
                }
                name={option.name}
                id={option.slug}
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {Array.isArray(formField.value) ? getBrokerValue(option.slug).split('; ').join(', ') : getBrokerValue(option.slug)}
                </div>
              )}
            </div>
          );
              case "checkbox":
          return (
            <div>
              <Checkbox
                checked={Boolean(formField.value)}
                onCheckedChange={formField.onChange}
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {getBrokerValue(option.slug) === 'true' ? 'true' : 'false'}
                </div>
              )}
            </div>
          );
              case "radio":
          return (
            <div>
              <RadioGroup
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                {option.meta_data?.map((metaData: any) => (
                  <div key={metaData.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={metaData.value}
                      id={`${option.slug}-${metaData.value}`}
                    />
                    <label htmlFor={`${option.slug}-${metaData.value}`}>
                      {metaData.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {getBrokerValue(option.slug)}
                </div>
              )}
            </div>
          );
              case "switch":
          return (
            <div>
              <Switch
                checked={Boolean(formField.value)}
                onCheckedChange={formField.onChange}
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {getBrokerValue(option.slug) === 'true' ? 'true' : 'false'}
                </div>
              )}
            </div>
          );
              case "date":
          return (
            <div>
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
                    {formField.value ? (
                      format(formField.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
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
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {getBrokerValue(option.slug) !== 'Not set' ? format(new Date(getBrokerValue(option.slug)), 'yyyy-MM-dd') : 'Not set'}
                </div>
              )}
            </div>
          );
              case "image":
          return (
            <div>
              {formField.value && typeof formField.value === "string" && (
                <div className="text-sm text-muted-foreground mb-2">
                  Current file:{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={formField.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-600 hover:text-blue-800"
                        >
                          {formField.value.split("/").pop()}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          padding: 0,
                        }}
                      >
                        <img
                          src={formField.value}
                          alt="Current file"
                          style={{
                            maxWidth: 200,
                            maxHeight: 200,
                            display: "block",
                            border: "none",
                            background: "transparent",
                            boxShadow: "none",
                          }}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    formField.onChange(file);
                  }
                }}
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {typeof getBrokerValue(option.slug) === 'string' ? (
                    <a href={getBrokerValue(option.slug)} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                      {getBrokerValue(option.slug).split('/').pop()}
                    </a>
                  ) : getBrokerValue(option.slug)}
                </div>
              )}
            </div>
          );
              default:
          return (
            <div>
              <Input
                type={option.form_type === "number" ? "text" : "text"}
                placeholder={
                  option.placeholder || `Enter ${option.name.toLowerCase()}`
                }
                {...formField}
                value={formField.value || ""} // Ensure value is never null
              />
              {is_admin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Broker value: {getBrokerValue(option.slug)}
                </div>
              )}
            </div>
          );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleServerActionSubmit)}
        className="space-y-8"
      >
        {options.map((option) => (
          <FormField
            key={option.id}
            control={form.control}
            name={option.slug}
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>{option.name}</FormLabel>
                  {option.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{option.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FormControl>{renderFormField(option, formField)}</FormControl>
                {option.description && (
                  <FormDescription>{option.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
