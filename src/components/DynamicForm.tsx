"use client";

import * as React from "react";
import { useState } from "react";
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
import { CalendarIcon, Copy } from "lucide-react";
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
  action?: (
    broker_id: number,
    formData: FormData,
    is_admin: boolean,
    originalData?: OptionValue[],
    entity_id?: number,
    entity_type?: string
  ) => Promise<void>;
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
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalOptionsValues, setOriginalOptionsValues] = useState(optionsValues);

  // Helper function to get broker value for admin display
  const getBrokerValue = (optionSlug: string) => {
    const optionValue = optionsValues.find(
      (optionValue) => optionValue.option_slug === optionSlug
    );
    return optionValue?.value || "Not set";
  };

  const IsUpdatedEntry = (optionSlug: string): boolean => {
    const optionValue = originalOptionsValues.find(
      (optionValue) => optionValue.option_slug === optionSlug
    );
    return optionValue?.is_updated_entry || false;
  };

  // const getBrokerPreviousValue = (optionSlug: string): string | null => {
  //   const optionValue = optionsValues.find(
  //     (optionValue) => optionValue.option_slug === optionSlug && optionValue.is_updated_entry
  //   );
  //   if(optionValue?.previous_value && optionValue.is_updated_entry){
  //     return optionValue?.previous_value + " "+(optionValue?.metadata?.unit || '') || null;
  //   }
  //   return null;
  // };
  const getBrokerPreviousValue = (optionSlug: string): string | null => {
    const optionValue = originalOptionsValues.find(
      (optionValue) => optionValue.option_slug === optionSlug 
    );

    if(optionValue?.previous_value){
      return optionValue?.previous_value + " "+(optionValue?.metadata?.unit || '') || null;
    }
    return null;
  };

  // Helper function to get broker metadata for admin display
  const getBrokerMetadata = (optionSlug: string, key: string) => {
    const optionValue = originalOptionsValues.find(
      (optionValue) => optionValue.option_slug === optionSlug
    );
    return optionValue?.metadata?.[key] || "Not set";
  };

  // Helper function to copy broker value to public value
  const copyBrokerToPublic = (optionSlug: string) => {
    const optionValue = originalOptionsValues.find(
      (optionValue) => optionValue.option_slug === optionSlug
    );
    if (optionValue) {

      // Update the form field with the broker value
      form.setValue(optionSlug, optionValue.value);

      //reset the is_updated_entry to false
      setOriginalOptionsValues((prev)=>{
        const next = [...prev];
        const found = next.find(ov => ov.option_slug === optionSlug);
        if (found) {
          found.is_updated_entry = false;
        }
        return next;
      });
      // Mark form as dirty to enable submit button
      setIsFormDirty(true);
    }
  };

  // Helper function to render option history (broker value and previous value)
  const renderOptionHistory = (option: Option) => {
    if (!is_admin) return null;

    // Precompute current and previous for safe comparison
    const isUpdatedEntry = IsUpdatedEntry(option.slug);
    const brokerValue = getBrokerValue(option.slug);
    const previousValue = getBrokerPreviousValue(option.slug);
    const showPrev = previousValue !== null && String(previousValue) !== String(brokerValue);

    return (
      <div
        className={cn("text-sm text-muted-foreground mt-2", {
          // Highlight only when a meaningful previous value exists and differs in show updated entry
          "text-red-500": isUpdatedEntry,
        })}
      >
        <div className="flex items-center justify-between">
          <div>
            <div>Broker value: {brokerValue}&nbsp;</div>
            { showPrev && (
              <div>Prev Value: {previousValue}</div>
            )}
          </div>
          {isUpdatedEntry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                copyBrokerToPublic(option.slug);
                e.currentTarget.classList.add("bg-green-100", "border-green-500", "text-green-700");
              }}
              className="p-1 h-6 w-6 flex-shrink-0 text-gray-600 hover:text-gray-800"
              title="Copy broker value to public value"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
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
          : z.object({
              value: z.number(),
              unit: z.string(),
            }).nullable().optional();
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
     
      case "number":
        let numberSchema = z.number();
        if (option.min_constraint) {
          numberSchema = numberSchema.min(option.min_constraint, `${option.name} must be at least ${option.min_constraint}`);
        }
        if (option.max_constraint) {
          numberSchema = numberSchema.max(option.max_constraint, `${option.name} must be at most ${option.max_constraint}`);
        }
        if (option.required === 1) {
          // Required: must be a number and meet min/max
          fieldSchema = z.preprocess(
            (val) => (val === "" ? null : Number(val)),
            numberSchema
          );
        } else {
          // Optional: null/undefined is allowed, but if filled, must meet min/max
          fieldSchema = z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
            numberSchema.nullable().optional()
          );
        }
        break;
      case "checkbox":
        if (option.required === 1) {
          fieldSchema = z.preprocess(
            (val) => (val === null || val === undefined ? false : Boolean(val)),
            z.boolean()
          );
        } else {
          fieldSchema = z.preprocess(
            (val) => (val === null || val === undefined ? null : Boolean(val)),
            z.boolean().nullable().optional()
          );
        }
        break;
     
      case "string":
      case "textarea":
        let baseString = z.string();
        if (option.min_constraint) {
          baseString = baseString.min(option.min_constraint, `${option.name} must be at least ${option.min_constraint} characters`);
        }
        if (option.max_constraint) {
          baseString = baseString.max(option.max_constraint, `${option.name} must be at most ${option.max_constraint} characters`);
        }
        if (option.required === 1) {
          const minValue = option.min_constraint ?? 1;
          baseString = baseString.min(minValue, `${option.name} is required`);
          fieldSchema = z.preprocess((val) => val === "" ? null : val, baseString);
        } else {
          fieldSchema = z.preprocess(
            (val) => val === "" ? null : val,
            baseString.nullable().optional()
          );
        }
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
        }else{
          fieldSchema = fieldSchema.nullable().optional();
        }
        break;
      case "notes":
        if (option.required === 1) {
          fieldSchema = z.array(z.string()).min(1, `Please select at least one ${option.name}`);
        } else {
          fieldSchema = z.array(z.string()).nullable().optional();
        }
        break;
      case "url":
        if (option.required === 1) {
          fieldSchema = z.string().min(1, "URL is required").url({ message: "Invalid URL" });
        } else {
          fieldSchema = z.string().url({ message: "Invalid URL" }).nullable().optional();
        }
        break;
      default:
        fieldSchema = z.string();
    }

    schemaObject[option.slug] = fieldSchema;
  }

  const formSchema = z.object(schemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: options.reduce((acc, option) => {
      let optionValue = originalOptionsValues?.find(
        (optionValue: OptionValue) => optionValue.option_slug === option.slug
      );
      if (optionValue !== null && optionValue !== undefined) {
        //if admin, populate form with public_value if it exists, otherwise use populate with optionValue.value
        let fieldValue = is_admin
          ? optionValue?.public_value === null ||
            optionValue?.public_value === "undefined"
            ? optionValue?.value
            : optionValue?.public_value
          : optionValue?.value;

        switch (option.form_type) {
          case "checkbox":
            return { ...acc, [option.slug]: fieldValue === "true" };
          case "multi-select":
            return { ...acc, [option.slug]: fieldValue?.split("; ") };

          case "notes":
            return { ...acc, [option.slug]: fieldValue?.split("; ") || [""] };

          case "numberWithUnit":
            return {
              ...acc,
              [option.slug]: {
                value: fieldValue ? parseFloat(fieldValue) : undefined,
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

  // Watch form changes to enable/disable submit button
  const formValues = form.watch();
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change") {
        setIsFormDirty(true);
        if (is_admin && name) {
          setOriginalOptionsValues((prev) => {
            const next = [...prev];
            const found = next.find((ov) => ov.option_slug === String(name));
            if (found) {
              found.is_updated_entry = false;
            }
            return next;
          });
        }
      }
      
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function handleServerActionSubmit(data: z.infer<typeof formSchema>) {
     //console.log("Server action form data from client:", data);

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

        // console.log(
        //   "Array field:",
        //   key,
        //   value,
        //   Array.isArray(value),
        //   typeof value === "object"
        // );
      }
    });

    // Call the Server Action
    if (action) {
      try {
        await action(
          broker_id,
          formDataObj,
          is_admin,
          optionsValues,
          entity_id,
          entity_type
        );
        toast.success("Form submitted successfully");
        // Reset form dirty state after successful submission
        setIsFormDirty(false);
        setIsSubmitting(false);
        // Refresh the page after successful submission using Next.js router
        router.refresh();
      } catch (error) {
        toast.error("Failed to submit form");
        console.error("Server action error:", error);
        setIsSubmitting(false);
      }
    }
  }

  const renderFormField = (option: Option, formField: any) => {
    switch (option.form_type) {
      case "numberWithUnit":
        const fieldError = form.formState.errors?.[option.slug];
        const unitError = fieldError && typeof fieldError === 'object' && 'unit' in fieldError ? (fieldError as any).unit : undefined;
        return (
          <div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={option.placeholder || `Enter ${option.name.toLowerCase()}`}
                min={option.min_constraint}
                max={option.max_constraint}
                value={formField.value?.value || ""}
                onChange={e =>
                  formField.onChange({
                    ...formField.value,
                    value: parseFloat(e.target.value),
                  })
                }
              />
              <Select
                value={formField.value?.unit || ""}
                onValueChange={unit =>
                  formField.onChange({ ...formField.value, unit })
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-[120px]",
                    option.required === 1 &&
                      unitError &&
                      "border-red-500 focus:border-red-500"
                  )}
                >
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
            {option.required === 1 && unitError && (
              <p className="text-sm text-red-500 mt-1">
                {`Unit is required for ${option.name}`}
              </p>
            )}
            {renderOptionHistory(option)}
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
            {renderOptionHistory(option)}
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
            {renderOptionHistory(option)}
          </div>
        );
      case "multiple_select":
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
            {renderOptionHistory(option)}
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={Boolean(formField.value)}
              onCheckedChange={formField.onChange}
              id={option.slug}
            />
            <FormLabel htmlFor={option.slug} className="text-sm font-medium cursor-pointer select-none">
              {option.name}
            </FormLabel>
            {renderOptionHistory(option)}
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
                <div
                  key={metaData.value}
                  className="flex items-center space-x-2"
                >
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
            {renderOptionHistory(option)}
          </div>
        );

      case "notes":
        return (
          <div>
            <div className="space-y-2">
              {Array.isArray(formField.value) &&
                formField.value.map((note: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Enter ${option.name.toLowerCase()} ${
                        index + 1
                      }`}
                      value={note || ""}
                      onChange={(e) => {
                        const newNotes = [...(formField.value || [])];
                        newNotes[index] = e.target.value;
                        formField.onChange(newNotes);
                      }}
                    />
                    {formField.value && formField.value.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newNotes = formField.value.filter(
                            (_: string, i: number) => i !== index
                          );
                          formField.onChange(newNotes);
                        }}
                        className="px-3"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newNotes = [...(formField.value || []), ""];
                  formField.onChange(newNotes);
                }}
                className="w-fit px-4 py-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors duration-200"
              >
                + Add Note
              </Button>
            </div>
            {renderOptionHistory(option)}
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
            {renderOptionHistory(option)}
          </div>
        );
      default:
        return (
          <div>
            <Input
              type={option.form_type === "number" ? "number" : "text"}
              placeholder={option.placeholder || `Enter ${option.name.toLowerCase()}`}
              {...formField}
              value={
                option.form_type === "number"
                  ? (formField.value === null || formField.value === undefined ? "" : formField.value)
                  : (formField.value || "")
              }
            />
            {renderOptionHistory(option)}
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
                {option.form_type !== "checkbox" && (
                  <div className="flex items-center gap-2">
                    <FormLabel>{option.name}{option.required === 1 && <span className="text-red-500 text-lg font-bold align-super" aria-label="required">*</span>}</FormLabel>
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
                )}
                <FormControl>{renderFormField(option, formField)}</FormControl>
                {option.description && (
                  <FormDescription>{option.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="submit"
          disabled={!isFormDirty}
          className={cn(
            "transition-all duration-300 font-medium",
            isFormDirty
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
              : "bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-not-allowed"
          )}
        >
          {isFormDirty ? "Save Changes" : "No Changes to Save"}
        </Button>
      </form>
    </Form>
  );
}