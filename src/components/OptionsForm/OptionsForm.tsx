"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";

import { Copy } from "lucide-react";
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
import logger from "@/lib/logger";
import { BrokerPreviousValue } from "@/components/OptionsForm/BrokerPreviousValue";
import { buildFormSchema } from "./buildFormSchema";
import { buildDefaultValues } from "./buildDefaultValues";
import { getInitialCopiedSlugs } from "./getInitialCopiedSlugs";
import { copyBrokerValueToPublic } from "./copyBrokerValueToPublic";
import { renderFormField } from "./renderFormField";
import { OptionInfoSections } from "./OptionInfoSections";

interface Props {
  broker_id: number;
  options: Option[];
  action?: (
    broker_id: number,
    formData: FormData,
    is_admin: boolean,
    originalData?: OptionValue[],
    entity_id?: number,
    entity_type?: string,
  ) => Promise<void>;
  optionsValues: OptionValue[];
  is_admin: boolean;
  entity_id?: number;
  entity_type?: string;
  display?: "cols" | "vertical";
}

export function OptionsForm({
  broker_id,
  options,
  action,
  optionsValues,
  is_admin,
  entity_id,
  entity_type,
  display = "cols",
}: Props) {
  const router = useRouter();

  const [isFormDirty, setIsFormDirty] = useState(is_admin);
  //console.log("option values: ",JSON.stringify(optionsValues,null,2))

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalOptionsValues, setOriginalOptionsValues] = useState(
    () => optionsValues,
  );

  const [clickedCopyButtons, setClickedCopyButtons] = useState<Set<string>>(
    () => getInitialCopiedSlugs(options, optionsValues, is_admin),
  );

  console.log("clicekd copyed", clickedCopyButtons);
  //this is used to refresh(empty)the file input when a new file is uploaded
  const [fileInputKey, setFileInputKey] = useState(0);

  const thisLogger = logger.child("OptionsForm Component");

  //sconsole.log("optionsValues", JSON.stringify(optionsValues, null, 2));
  //NOTE:
  //===Form initialization with optionsValues:===
  //If admin is true, the form field value is set to the optionValue.public_value if it is null, otherwise it is set to the optionValue.value
  //this is used to auto populate the public values with the broker value if public_value is not set
  //The data submitted to server action by admin is considered as public_value,
  //===Form initialization with optionsValues:===s

  const copyBrokerToPublic = (optionSlug: string) => {
    copyBrokerValueToPublic({
      optionSlug,
      originalOptionsValues,
      options,
      form,
      setOriginalOptionsValues,
      setIsFormDirty,
    });
  };

  // Helper function to render option history (broker value and previous value)
  const renderOptionHistory = (option: Option) => {
    if (!is_admin) return null;
    const optionValue = originalOptionsValues.find(
      (optionValue) => optionValue.option_slug === option.slug,
    );

    const isUpdatedEntry = optionValue?.is_updated_entry;

    const brokerValue = optionValue?.value;

    const previousValue = optionValue?.previous_value;

    const showPrev = previousValue !== null;

    const metadataUnit = optionValue?.metadata?.value?.unit ?? "";

    return (
      <div
        className={cn("text-sm text-muted-foreground mt-2 p-3", {
          "border-1 border-red-500": isUpdatedEntry,
        })}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <BrokerPreviousValue
              brokerValue={brokerValue + " " + metadataUnit}
              previousValue={previousValue ?? ""}
              {...(option.form_type === "notes"
                ? { splitBrokerValueBy: ";" }
                : {})}
            />
          </div>
          {(!!isUpdatedEntry || clickedCopyButtons?.has(option.slug)) && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  copyBrokerToPublic(option.slug);
                  // Add to clicked buttons set
                  setClickedCopyButtons((prev) =>
                    new Set(prev).add(option.slug),
                  );
                  setIsFormDirty(true);
                }}
                className={cn(
                  "p-1 h-6 w-6 flex-shrink-0",
                  clickedCopyButtons?.has(option.slug)
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700 hover:bg-red-200",
                )}
                title="Copy broker value to public value"
              >
                <Copy className="h-3 w-3" />
              </Button>

              <Checkbox
                type="button"
                className="size-5 cursor-pointer border-green-800 hover:bg-green-100 data-[state=checked]:border-green-800 data-[state=checked]:bg-green-800 data-[state=checked]:text-white data-[state=checked]:hover:bg-green-900"
                title="Mark field as reviewed"
                aria-label="Mark field as reviewed"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const formSchema = React.useMemo(() => buildFormSchema(options), [options]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(options, optionsValues, is_admin),
  });

  // Watch form changes to enable/disable submit button
  // const formValues = form.watch();
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change") {
        setIsFormDirty(true);
        if (is_admin && name) {
          setOriginalOptionsValues((prev) => {
            return prev.map((ov) =>
              ov.option_slug === String(name)
                ? { ...ov, is_updated_entry: false }
                : ov,
            );
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  React.useEffect(() => {
    form.reset(buildDefaultValues(options, optionsValues, is_admin));
    setOriginalOptionsValues(optionsValues);
    setClickedCopyButtons(
      getInitialCopiedSlugs(options, optionsValues, is_admin),
    );
  }, [optionsValues, options, is_admin, form]);

  async function handleServerActionSubmit(data: z.infer<typeof formSchema>) {
    thisLogger.debug("Form data before sending to server", {
      context: { data },
    });

    // Trigger validation for all fields
    const isValid = await form.trigger();
    if (!isValid) {
      thisLogger.debug("Form validation failed", {
        context: { errors: form.formState.errors },
      });
      return;
    }
    // dynamicFormLogger.debug("Detailed form data", { context: { data, fieldCount: Object.keys(data).length } });
    // Convert to FormData for Server Action
    const formDataObj = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      // if (value !== undefined && value !== null) {
      if (value instanceof File) {
        // Handle file uploads
        formDataObj.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle arrays by joining with semicolon
        //this is used for multi-select and notes
        formDataObj.append(key, value.join("#-#"));
      } else if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        //this is used for numberWithUnit that are sent as object with unit and value
        formDataObj.append(key, JSON.stringify(value));
      } else {
        //this is used for other fields that are sent as string
        formDataObj.append(key, value);
      }

      // }
    });

    thisLogger.debug("Form data before sending to server", {
      context: { formDataObj },
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
          entity_type,
        );
        toast.success("Form submitted successfully");
        // Reset form dirty state after successful submission

        setIsFormDirty(false);
        setIsSubmitting(false);
        setClickedCopyButtons(new Set());
        // Refresh the page after successful submission using Next.js router
        router.refresh();
        setFileInputKey((key) => key + 1);
      } catch (error) {
        toast.error("Failed to submit form");

        thisLogger.error(
          "Form error message received in client after server action failed",
          {
            error,
            context: {
              broker_id,
              is_admin,
              entity_id,
              entity_type,
              fieldCount: Object.keys(data).length,
            },
          },
        );
        setIsSubmitting(false);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleServerActionSubmit)}
        className="space-y-8"
      >
        <div
          className={cn(
            "w-full",
            display === "vertical"
              ? "flex flex-col gap-y-8"
              : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8",
          )}
        >
          {options.map((option, idx) => {
            return (
              <FormField
                key={option.id}
                control={form.control}
                name={option.slug}
                render={({ field: formField }) => (
                  <FormItem>
                    {option.form_type !== "checkbox" && (
                      <div className="flex items-center gap-2">
                        <FormLabel>
                          {option.name}
                          {option.required === 1 && (
                            <span
                              className="text-red-500 text-lg font-bold align-super"
                              aria-label="required"
                            >
                              *
                            </span>
                          )}
                          {is_admin &&
                            (option.visible_for_user == 0 ||
                              option.visible_for_user === false) && (
                              <span className="text-green-500 text-xs font-bold align-super">
                                (Admin only)
                              </span>
                            )}
                        </FormLabel>
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
                        {option.info_sections &&
                          option.info_sections.length > 0 && (
                            <OptionInfoSections
                              layout = {option.info_section_layout}
                              isAdmin={is_admin}
                              infoSections={option.info_sections}
                              optionName={option.name}
                            />
                          )}
                      </div>
                    )}
                    <FormControl>
                      {renderFormField(
                        option,
                        formField,
                        form,
                        renderOptionHistory,
                        fileInputKey,
                      )}
                    </FormControl>
                    {option.description && (
                      <FormDescription>{option.description}</FormDescription>
                    )}
                    {/* Custom error display for notes fields */}
                    {form.formState.errors[option.slug] &&
                    option.form_type === "notes" ? (
                      <div className="text-sm text-red-500 mt-1">
                        {Array.isArray(form.formState.errors[option.slug])
                          ? (
                              form.formState.errors[
                                option.slug
                              ] as unknown as any[]
                            ).map((error: any, index: number) => (
                              <div key={index}>{error.message}</div>
                            ))
                          : (form.formState.errors[option.slug] as any)
                              ?.message}
                      </div>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
            );
          })}
        </div>
        <Button
          type="submit"
          disabled={!isFormDirty}
          className={cn(
            "transition-all duration-300 font-medium",
            isFormDirty
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
              : "bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-not-allowed",
          )}
        >
          {isFormDirty ? "Save Changes" : "No Changes to Save"}
        </Button>
      </form>
    </Form>
  );
}
