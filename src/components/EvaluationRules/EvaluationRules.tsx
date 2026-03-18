"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Info, LayoutGrid } from "lucide-react";
import { EvaluationFormConfig } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";

type EvaluationFormValues = Record<string, string>;

export default function EvaluationRules({
  formConfig,
  brokerId,
  is_admin,
}: {
  formConfig: EvaluationFormConfig;
  brokerId: number;
  is_admin: boolean;
}) {
  const section = useMemo(() => {
    const firstSection = Object.values(formConfig.sections)[0];
    return firstSection ?? null;
  }, [formConfig.sections]);

  const fields = useMemo(() => {
    if (!section) return [];
    return Object.entries(section.fields).map(([name, config]) => ({
      name,
      config,
    }));
  }, [section]);
  // example:fields
  // [
  //   { name: "copy-trading#1", config: ... },
  //   { name: "scalping#2", config: ... }
  // ]

  const defaultValues = useMemo<EvaluationFormValues>(
    () =>
      fields.reduce<EvaluationFormValues>((acc, field) => {
        acc[field.name] = "";
        acc[`${field.name}_getter`] = "";  
        return acc;
      }, {}),
    [fields],
  );

  const form = useForm<EvaluationFormValues>({
    defaultValues,
  });

  const onSubmit = async (values: EvaluationFormValues) => {
    // Wire API save here in the next step.
    console.log(values);
    // Send the values to the API.
    const saveEvaluationRulesUrl = "/evaluation-rules";
    await apiClient<boolean>(
      saveEvaluationRulesUrl,
      UseTokenAuth.No,
      { method: "POST", body: JSON.stringify(values) },
      ErrorMode.Return,
    );
  };

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  // Keep this for future submit integration
  void brokerId;
  void is_admin;

  return (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-gray-900 border-0 shadow-none overflow-hidden">
      <div className="relative px-5 sm:px-6 py-5 sm:py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {formConfig.name}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {formConfig.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-green-600 dark:text-green-400 font-mono">
              #{brokerId}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
        <div className="max-w-7xl mx-auto bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-4 border border-dashed border-gray-200 dark:border-gray-700">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {section && (
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {section.label}
              </h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {fields.map(({ name, config: rules_field_config }) => (
                <Controller
                  key={name}
                  control={form.control}
                  name={name}
                  defaultValue=""
                  rules={{
                    required: rules_field_config.required
                      ? `${rules_field_config.label} is required`
                      : false,
                  }}
                  render={({ field }) => {
                    const getterFieldName = `${name}_getter`;
                    const selectedOption = rules_field_config.options.find(
                      (option) => String(option.value) === field.value,
                    );
                    const selectedOptionIsGetter = selectedOption?.is_getter === 1;
                    const fieldError = form.formState.errors[name];

                    return (
                      <Field
                        orientation="responsive"
                        className="items-start gap-0.5"
                      >
                        <FieldLabel className="w-full pt-0 md:!flex-none md:w-24 md:whitespace-nowrap md:pt-2">
                            {rules_field_config.label}
                        </FieldLabel>

                        <FieldContent className="min-w-0 space-y-1">
                            <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-start">
                              <Select
                              value={field.value ?? ""}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const option = rules_field_config.options.find(
                                    (opt) => String(opt.value) === value,
                                  );
                                  //if the option is not found or the option is not a getter, set the getter field to empty
                                  //this is when user select a non-getter option after he initiallly selected and filled a getter option
                                  if (!option || option.is_getter !== 1) {
                                    form.setValue(
                                      getterFieldName as keyof EvaluationFormValues,
                                      "",
                                    );
                                  }
                                }}
                              >
                              <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={`Select ${rules_field_config.label}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {rules_field_config.options.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={String(option.value)}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                            </div>

                            {selectedOptionIsGetter && (
                              <Controller
                                control={form.control}
                                name={getterFieldName}
                                defaultValue=""
                                render={({ field: getterField }) => (
                                  <div className="flex items-center gap-2">
                                    {selectedOption?.description && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                              aria-label="Show option description"
                                            >
                                              <Info className="h-4 w-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {selectedOption.description}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    <Input
                                      value={getterField.value ?? ""}
                                      onChange={getterField.onChange}
                                      placeholder="Enter value"
                                      className="w-full"
                                    />
                                  </div>
                                )}
                              />
                            )}

                            {!selectedOptionIsGetter && selectedOption?.description && (
                              <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                {selectedOption.description}
                              </p>
                            )}

                            <FieldError
                              errors={
                                fieldError
                                  ? [{ message: String(fieldError.message ?? "") }]
                                  : []
                              }
                            />
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="min-w-28 bg-green-600 hover:bg-green-700 text-white border border-green-700"
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}