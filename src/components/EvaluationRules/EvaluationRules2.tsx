"use client";
import {
  EvaluationFormConfig,
  EvaluationRule,
  SelectFieldConfig,
} from "./types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StringArrayGetterField } from "./StringArrayGetterField";
import { z } from "zod";
import buildDefaultFormValues from "./buildDefaultFormValues";
import getFormSchema from "./getFormSchema";
import { getFormFields } from "./getFormFields";
import {
  FieldLabel,
  FieldDescription,
  FieldError,
  Field,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { apiClient } from "@/lib/api-client";
import logger from "@/lib/logger";
type Props = {
  formConfig: EvaluationFormConfig;
  brokerId: number;
  is_admin: boolean;
  evaluationRules?: EvaluationRule[];
};

const SELECT_EMPTY_VALUE = "_none_";
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

export default function EvaluationRules2({
  formConfig,
  brokerId,
  is_admin,
  evaluationRules,
}: Props) {
  const thisLogger = logger.child("EvaluationRules2" );
  const fields = getFormFields(formConfig);
  const router = useRouter();
  const formSchema = getFormSchema(formConfig);
  const initialValues = useMemo(
    () => buildDefaultFormValues(is_admin, formConfig, evaluationRules ?? []),
    [is_admin, formConfig, evaluationRules],
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultFormValues(
      is_admin,
      formConfig,
      evaluationRules ?? [],
    ),
    shouldUnregister: true,
  });

  useEffect(() => {
    form.reset(buildDefaultFormValues(
      is_admin,
      formConfig,
      evaluationRules ?? [],
    ));
  }, [is_admin,formConfig,evaluationRules]);

  const onSubmit =async (data: z.infer<typeof formSchema>) => {
    const saveEvaluationRulesUrl = "/evaluation-rules/" + brokerId;

    const normalize = (v: string | number | null) =>
      v === "" || v === "_none_" ? null : v;
    const dataToSend: Record<string, string | number | null> = {};
    //send only the options ids and getter values to the server
    for (const [name] of Object.entries(fields)) {
      dataToSend[name] = normalize(data[name]);
      const getterKey = `${name}_getter`;
      if (getterKey in data) {
       if (Array.isArray(data[getterKey])) {
        dataToSend[getterKey] = data[getterKey].join("#-#");
       } else {
        dataToSend[getterKey] = normalize(data[getterKey]);
      }
      }
    }

    thisLogger.info("Evaluation rules submitted", { context: { dataToSend } });
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

  function renderField(name: string, fieldConfig: SelectFieldConfig) {
    const selectedValue = form.watch(name);
    const selectedOption = fieldConfig.options.find(
      (o) => String(o.value) === String(selectedValue),
    );

    const optionDescription = selectedOption?.description ?? "";

    const showGetter = selectedOption?.is_getter == 1;
    const getterType = selectedOption?.getter_type ?? "string";
    const getterPlaceholder = selectedOption?.placeholder;
    const isRequired = fieldConfig.required;

    return (
      <>
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{fieldConfig.label}
              {isRequired ? <span className="text-destructive ml-0.5" aria-hidden>*</span> : null}
            </FieldLabel>
            {optionDescription && <FieldDescription>{optionDescription}</FieldDescription>}
            <Select
              value={
                field.value != null &&
                field.value !== "" &&
                field.value !== SELECT_EMPTY_VALUE
                  ? String(field.value)
                  : ""
              }
              onValueChange={(value) => {
                const nextValue =
                  value === SELECT_EMPTY_VALUE ? "" : value;
                field.onChange(nextValue);
                const option = fieldConfig.options.find(
                  (o) => String(o.value) === nextValue,
                );
                if (option?.is_getter == 1) {
                  const type = option.getter_type ?? "string";

                  //restore the getter default value recievd from server in edit mode
                  const getterDefaultValue = initialValues[`${name}_getter`];
                  if (getterDefaultValue) {
                    form.setValue(
                      `${name}_getter`,
                       getterDefaultValue,
                    );
                  } else {
                    form.setValue(
                      `${name}_getter`,
                      type === "string_array" ? [""] : "",
                    );
                  }
                } else {
                  form.unregister(`${name}_getter`);
                  form.clearErrors(`${name}_getter`);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={SELECT_EMPTY_VALUE}
                  className="text-muted-foreground"
                >
                  Empty
                </SelectItem>
                {fieldConfig.options.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      {showGetter && getterType === "string" && (
        <Controller
          control={form.control}
          name={`${name}_getter`}
          render={({ field,fieldState }) => (
            <Field aria-invalid={fieldState.invalid}>
             
              <Input
                {...field}
                value={field.value != null ? String(field.value) : ""}
                aria-invalid={fieldState.invalid}
                placeholder={getterPlaceholder ?? undefined}
              />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      )}
      {showGetter && getterType === "textarea" && (
        <Controller
          control={form.control}
          name={`${name}_getter`}
          render={({ field,fieldState }) => (
            <Field aria-invalid={fieldState.invalid}>
             
              <Textarea
                {...field}
                value={field.value != null ? String(field.value) : ""}
                aria-invalid={fieldState.invalid}
                placeholder={getterPlaceholder ?? undefined}
              />
              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      )}
      {showGetter && getterType === "string_array" && (
        <StringArrayGetterField
          name={name}
          control={form.control}
          placeholder={getterPlaceholder}
        />
      )}
      </>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mx-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        {Object.entries(fields).map(([name, fieldConfig]) => (
          <div
            key={name}
            className="min-w-0 space-y-3 rounded-lg border border-gray-200 bg-[#fdfdfd] p-4 dark:border-gray-700 dark:bg-gray-800/60"
          >
            {renderField(name, fieldConfig)}
          </div>
        ))}
      </div>
      <div className="mx-4 mt-6 flex justify-end">
        <Button
          type="submit"
          className="min-w-28 border border-green-700 bg-green-600 text-white hover:bg-green-700"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
