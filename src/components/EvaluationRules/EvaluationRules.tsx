"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Copy, Info, LayoutGrid } from "lucide-react";
import { EvaluationFormConfig, type EvaluationRule } from "./types";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { useState } from "react";
import PreviousValues from "./PreviousValues";
type EvaluationFormValues = Record<string, string | number>;

const buildCopiedFields = (
  evaluationRules: EvaluationRule[] | undefined,
  is_admin: boolean,
): Set<string> => {
  if (!is_admin) return new Set<string>();
  const copied = new Set<string>();
  for (const rule of evaluationRules ?? []) {
    const key = rule.evaluation_rule_slug + "#" + rule.evaluation_rule_id;
    if (
      rule.evaluation_option_id != null &&
      rule.public_evaluation_option_id == null
    ) {
      copied.add(key);
    }

    const adminDetailsMissing =
      rule.public_details == null || rule.public_details === "";
    const brokerDetailsPresent = rule.details != null && rule.details !== "";
    //this condition is for the case when broker evaluation is not a getter, hence the public_details is null
    //so it detect that de details should be copied to the public_details and the copied btn appears in green color
    //to avoid this error we introduce the getterStatesAligned condition
    const getterStatesAligned = rule.is_getter == rule.is_getter_for_admin;
    if (adminDetailsMissing && brokerDetailsPresent && getterStatesAligned) {
      copied.add(`${key}_getter`);
    }
  }
  return copied;
};
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
  const thisLogger = logger.child("EvaluationRules");
  const router = useRouter();

  const [copiedFields, setCopiedFields] = useState<Set<string>>(() =>
    buildCopiedFields(evaluationRules, is_admin),
  );

  thisLogger.debug("Copied fields", { context: copiedFields });

  const fields = useMemo(() => {
    const firstSection = Object.values(formConfig.sections)[0];
    if (!firstSection) return [];
    return Object.entries(firstSection.fields).map(([name, config]) => ({
      name,
      config,
    }));
  }, [formConfig.sections]);
  // example:fields->copy-trading is the option rule slug and 1 is it's id
  // [
  //   { name: "copy-trading#1", config: ... },
  //   { name: "scalping#2", config: ... }
  // ]
  thisLogger.debug("Evaluation rules received in props", {
    context: evaluationRules,
  });
  const initialValues = useMemo<EvaluationFormValues>(() => {
    const acc: EvaluationFormValues = {};
    for (const field of fields) {
      acc[field.name] = "";
      acc[`${field.name}_is_updated_entry`] = 0;
      let fiedsIsGetter = field.config.options.some(
        (option) => option.is_getter === 1,
      );
      if (fiedsIsGetter) {
        acc[`${field.name}_getter`] = "";

        if (is_admin) {
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
      //     "is_getter_for_admin": 0,
      //     "is_updated_entry": 0,
      //     "created_at": null,
      //     "updated_at": "2026-03-20T12:47:25.000000Z"
      // },
      const key = rule.evaluation_rule_slug + "#" + rule.evaluation_rule_id;
      if (!key || !fields.some((f) => f.name === key)) continue;

      const optionId = is_admin
        ? (rule.public_evaluation_option_id ?? rule.evaluation_option_id)
        : rule.evaluation_option_id;
      acc[key] = String(optionId);
     

      if (is_admin) {
        acc[`${key}_broker_value_raw`] =
          String(rule.evaluation_option_value) +
          "#" +
          String(rule.evaluation_option_id);
        //acc[`${key}_broker_value`] = String(rule.evaluation_option_label?? "")+"#"+String(rule.evaluation_option_id);
        acc[`${key}_broker_value`] = String(rule.evaluation_option_label ?? "");
        acc[`${key}_broker_option_id`] = String(rule.evaluation_option_id);

        acc[`${key}_previous_value`] = String(rule.previous_evaluation_options);
        acc[`${key}_getter_previous_value`] = String(rule.previous_details ?? "");
          
        
      }

      //==>getter meaning=====
      //if an option is a getter, when user select it than an text input field is shown under the select box

      //rule's getter are stored im details and public_details and previous_details in broker_evaluations table
      if (rule.is_getter === 1 || rule.is_getter_for_admin === 1) {
        const details = is_admin
          ? (rule.public_details ?? rule.details)
          : rule.details;
        acc[`${key}_getter`] = details != null ? String(details) : "";

        if (is_admin) {
          acc[`${key}_getter_broker_value`] = String(rule.details ?? "");
          
        }
      }

      if (is_admin && rule.is_getter === 1 && rule.is_getter_for_admin === 0) {
        //if the public_evaluation_option_id is not getter,i.e is_getter_for_admin is 0,
        //  then attach the broker getter value(details column in broker_evaluations) to broker_value

        acc[`${key}_broker_value`] =
          String(rule.evaluation_option_label) +
          " ==> " +
          "isGetter: " +
          String(rule.details);

        //if is not getter for admin and is getter for broker, show the broker previous getter values when render the form
        //acc[`${key}_show_prev_getter`] = 1;

        acc[`${key}_getter`] = rule.details ?? "";
      }

      if (rule.is_updated_entry === 1) {
        acc[`${key}_is_updated_entry`] = 1;
      }
    }

    return acc;
  }, [fields, evaluationRules, is_admin]);

  const form = useForm<EvaluationFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
    setCopiedFields(buildCopiedFields(evaluationRules, is_admin));
  }, [initialValues, evaluationRules, is_admin, form]);

  const onSubmit = async (values: EvaluationFormValues) => {
    thisLogger.info("Evaluation rules submitted", { context: { values } });
    const saveEvaluationRulesUrl = "/evaluation-rules/" + brokerId;

    const dataToSend: EvaluationFormValues = {};
    //send only the options ids and getter values to the server
    for (const { name } of fields) {
      dataToSend[name] = values[name];
      const getterKey = `${name}_getter`;
      if (getterKey in values) {
        dataToSend[getterKey] = values[getterKey];
      }
    }
    const response = await apiClient<boolean>(
      saveEvaluationRulesUrl,
      UseTokenAuth.Yes,
      { method: "POST", body: JSON.stringify(dataToSend) },
      ErrorMode.Return,
    );
    if (response.success) {
      toast.success("Evaluation rules saved successfully");
      router.refresh();
    } else {
      toast.error(response.message ?? "Failed to save evaluation rules");
    }
  };

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
                    const isCopiedField =
                      copiedFields.has(name) ||
                      copiedFields.has(getterFieldName);
                    const selectedOption = rules_field_config.options.find(
                      (option) => String(option.value) === field.value,
                    );
                    const selectedOptionIsGetter =
                      selectedOption?.is_getter === 1;

                    const fieldError = form.formState.errors[name];

                    const selectedOptionGetterPlaceholder = selectedOption?.getter_placeholder ?? "Custom placeholder";

                    const isUpdatedEntry = form.watch(
                      `${name}_is_updated_entry`,
                    );
                    const getterValue = form.watch(getterFieldName);

                    //check if field has getter previous values
                    const hasGetterPreviousValues = form.watch(
                      `${name}_getter_previous_value`,
                    ) !== "";

                    return (
                      <Field
                        orientation="responsive"
                        className="items-start gap-0.5"
                      >
                        <FieldLabel className="w-full pt-0 md:!flex-none md:w-24 md:whitespace-nowrap md:pt-2">
                          <span className="inline-flex items-center gap-1">
                            {rules_field_config.label}
                            {selectedOption?.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                                      aria-label="Show option description"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {selectedOption.description}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </span>
                        </FieldLabel>

                        <FieldContent className="min-w-0 space-y-1">
                          <div className="flex w-full min-w-0 flex-col gap-2">
                            <Select
                              value={String(field.value ?? "")}
                              onValueChange={(value) => {
                                field.onChange(value);
                                const option = rules_field_config.options.find(
                                  (o) => String(o.value) === value,
                                );

                                //set the is_updated_entry value to 0
                                form.setValue(`${name}_is_updated_entry`, 0);
                                //if the selected option is not a getter,
                                // set the getter value to empty string
                                //this send to server empty string to update the getter data (details column in broker_evaluations)
                                if (option?.is_getter !== 1) {
                                  form.setValue(getterFieldName, "");
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

                            {is_admin && (
                              <div
                                className={cn(
                                  "flex flex-col gap-1 border pt-2 px-2 pb-2 rounded-md",
                                  isUpdatedEntry
                                    ? "border-red-500 border-1 dark:border-red-500"
                                    : "border-gray-200 dark:border-gray-700",
                                )}
                              >
                                <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                  Broker Value:{" "}
                                  {form.getValues(`${name}_broker_value`)}
                                </p>
                                <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                  <PreviousValues
                                    previousValues={String(
                                      form.getValues(`${name}_previous_value`),
                                    )}
                                  ></PreviousValues>
                                </p>

                                {/* if show_prev_getter is 1, show the previous getter values */}
                                {/* this happens when is_getter is 1 and is_getter_for_admin is 0*/}
                                {/* this is used to show the previous getter values in the admin view */}
                                {hasGetterPreviousValues && (
                                  <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                    <PreviousValues
                                      label="Previous Getter Values"
                                      previousValues={String(
                                        form.getValues(
                                          `${name}_getter_previous_value`,
                                        ) ?? "",
                                      )}
                                    ></PreviousValues>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {selectedOptionIsGetter && (
                            <div className="flex w-full flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  key={getterFieldName}
                                  value={String(getterValue ?? "")}
                                  onChange={(event) => {
                                    form.setValue(
                                      getterFieldName,
                                      event.target.value,
                                    );
                                    form.setValue(
                                      `${name}_is_updated_entry`,
                                      0,
                                    );
                                  }}
                                  placeholder={selectedOptionGetterPlaceholder}
                                  className="w-full"
                                />
                              </div>
                              {is_admin && (
                                <div
                                  className={cn(
                                    "flex flex-col gap-1 border pt-2 px-2 pb-2 rounded-md",
                                    isUpdatedEntry
                                      ? "border-red-500 border-1 dark:border-red-500"
                                      : "border-gray-200 dark:border-gray-700",
                                  )}
                                >
                                  <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                    Broker Value:{" "}
                                    {form.getValues(
                                      `${getterFieldName}_broker_value`,
                                    )}
                                  </p>
                                  {/* <p className="min-w-0 w-full text-sm leading-relaxed text-muted-foreground whitespace-normal [overflow-wrap:anywhere] break-all">
                                    <PreviousValues
                                      label="Previous Getter Values"
                                      previousValues={String(
                                        form.getValues(
                                          `${getterFieldName}_previous_value`,
                                        ),
                                      )}
                                    ></PreviousValues>
                                  </p> */}
                                </div>
                              )}
                            </div>
                          )}

                          <FieldError
                            errors={
                              fieldError
                                ? [
                                    {
                                      message: String(fieldError.message ?? ""),
                                    },
                                  ]
                                : []
                            }
                          />
                          {!!is_admin &&
                            (!!isCopiedField || !!isUpdatedEntry) && (
                              <div className="mt-2 flex w-full justify-end">
                                <div className="flex shrink-0 items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    className={cn(
                                      "shrink-0",
                                      isCopiedField &&
                                        "border-green-500 text-green-600 hover:bg-green-50",
                                      isUpdatedEntry &&
                                        "border-red-500 text-red-600 hover:bg-red-50",
                                    )}
                                    title="Copy broker defaults"
                                    aria-label="Copy broker defaults"
                                    onClick={() => {
                                      const brokerVal =
                                        initialValues[name + "_broker_value"];
                                      // const brokerValId =
                                      //   String(brokerVal ?? "").split("#")[1] ?? "";
                                      const brokerValId =
                                        initialValues[
                                          name + "_broker_option_id"
                                        ] ?? "";

                                      const getterVal =
                                        initialValues[
                                          getterFieldName + "_broker_value"
                                        ];

                                      setCopiedFields((prev) => {
                                        const next = new Set(prev);
                                        next.add(name);
                                        next.add(getterFieldName);
                                        return next;
                                      });
                                      form.reset({
                                        ...initialValues,
                                        ...form.getValues(),
                                        [name]: brokerValId,
                                        [getterFieldName]: getterVal,
                                        [name + "_is_updated_entry"]: 0,
                                      });
                                    }}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                  <Checkbox
                                    className="size-5 cursor-pointer border-green-800 hover:bg-green-100 data-[state=checked]:border-green-800 data-[state=checked]:bg-green-800 data-[state=checked]:text-white data-[state=checked]:hover:bg-green-900"
                                    title="Mark field as reviewed"
                                    aria-label="Mark field as reviewed"
                                  />
                                </div>
                              </div>
                            )}
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