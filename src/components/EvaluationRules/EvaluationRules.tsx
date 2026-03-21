"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Info, LayoutGrid } from "lucide-react";
import { EvaluationFormConfig, type EvaluationRule } from "./types";
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
  evaluationRules,
}: {
  formConfig: EvaluationFormConfig;
  brokerId: number;
  is_admin: boolean;
  evaluationRules?: EvaluationRule[];
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

  const initialValues = useMemo<EvaluationFormValues>(() => {
    const acc: EvaluationFormValues = {};
    for (const field of fields) {
      acc[field.name] = "";
      let fiedsIsGetter = field.config.options.some((option) => option.is_getter === 1);
      if(fiedsIsGetter){
        acc[`${field.name}_getter`] = "";
        if(is_admin){
          acc[`${field.name}_getter_broker_value`] = "";
          acc[`${field.name}_getter_previous_value`] = "";
        }
      }
    }

    for (const rule of evaluationRules ?? []) {
     // Example of a broker evaluation rule(a processed row from broker_evaluations table):
    //   {
    //     "id": 1,
    //     "broker_id": 181,
    //     "zone_id": null,
    //     "evaluation_rule_id": 1,
    //     "evaluation_option_id": 2,
    //     "public_evaluation_option_id": null,
    //     "details": null,
    //     "public_details": null,
    //     "previous_evaluation_option_id": null,
    //     "previous_evaluation_option_value": null,
    //     "previous_details": null,
    //     "evaluation_rule_slug": "copy-trading",
    //     "evaluation_option_value": "not-allowed",
    //     "is_getter": 0,
    //     "is_updated_entry": 0,
    //     "created_at": null,
    //     "updated_at": "2026-03-20T12:47:25.000000Z"
    // },
      const key = rule.evaluation_rule_slug+"#"+rule.evaluation_rule_id;
      if (!key || !fields.some((f) => f.name === key)) continue;

      const optionId = is_admin  ? rule.public_evaluation_option_id : rule.evaluation_option_id;
      acc[key] = String(optionId);
      if(is_admin){
        acc[`${key}_broker_value`] = String(rule.evaluation_option_value);
        acc[`${key}_previous_value`] = String(rule.previous_evaluation_option_value);
      }
      
      
     
       if(rule.is_getter === 1){
        const details = is_admin? rule.public_details  : rule.details ;
        acc[`${key}_getter`] = details != null ? String(details) : "";
        if(is_admin){
          acc[`${key}_getter_broker_value`] = String(rule.details?? "");
          acc[`${key}_getter_previous_value`] = String(rule.previous_details?? "");
        }
       }

      
    }

    return acc;
  }, [fields, evaluationRules, is_admin]);

  const form = useForm<EvaluationFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  const onSubmit = async (values: EvaluationFormValues) => {
    console.log(values);
    const saveEvaluationRulesUrl = "/evaluation-rules";
    await apiClient<boolean>(
      saveEvaluationRulesUrl,
      UseTokenAuth.No,
      { method: "POST", body: JSON.stringify(values) },
      ErrorMode.Return,
    );
  };

  void brokerId;

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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Evaluation Rules Definition
            </h3>

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
                          <div className="flex w-full min-w-0 flex-col gap-2">
                            <Select
                              value={field.value ?? ""}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  
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
                            {!selectedOptionIsGetter &&
                            selectedOption?.description && (
                              <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                {selectedOption.description}
                              </p>
                            )}

                            {is_admin && (
                              <div className="flex flex-col gap-1 border border-gray-200 dark:border-gray-700 pt-2 px-2 pb-2 rounded-md">
                                <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                  Broker Value:{" "}
                                  {form.getValues(
                                    `${name}_broker_value`,
                                  )}
                                </p>
                                <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                  Previous Value:{" "}
                                  {form.getValues(
                                    `${name}_previous_value`,
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {selectedOptionIsGetter && (
                            <Controller
                              control={form.control}
                              name={getterFieldName}
                              defaultValue=""
                              render={({ field: getterField }) => (
                                <div className="flex w-full flex-col gap-2">
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
                                  {is_admin && (
                                    <div className="flex flex-col gap-1 border border-gray-200 dark:border-gray-700 pt-2 px-2 pb-2 rounded-md">
                                      <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                        Broker Value:{" "}
                                        {form.getValues(
                                          `${getterFieldName}_broker_value`,
                                        )}
                                      </p>
                                      <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                        Previous Value:{" "}
                                        {form.getValues(
                                          `${getterFieldName}_previous_value`,
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          )}

                          

                          <FieldError
                            errors={
                              fieldError
                                ? [
                                    {
                                      message: String(
                                        fieldError.message ?? "",
                                      ),
                                    },
                                  ]
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
