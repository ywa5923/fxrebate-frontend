"use client";
import {
  EvaluationFormConfig,
  EvaluationRule,
  SelectFieldConfig,
} from "./types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StringArrayGetterField2 } from "./StringArrayGetterField2";
import { z } from "zod";
import buildDefaultFormValues from "./buildDefaultFormValues";
import getFormSchema from "./getFormSchema";
import { getFormFields } from "./getFormFields";
import {
  FieldLabel,
  FieldDescription,
  FieldError,
  Field,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Copy, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { apiClient } from "@/lib/api-client";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";
import PreviousValues from "./PreviousValues";
import BrokerValue from "./BrokerValue";
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

  //get default form values as initial values and copied values
  const [initialValues, initialCopiedValues] = useMemo(
    () => buildDefaultFormValues(is_admin, formConfig, evaluationRules ?? []),
    [is_admin, formConfig, evaluationRules],
  );

  //set the copied fields
  const [copiedFields, setCopiedFields] = useState<string[]>(
    () => initialCopiedValues,
  );

  //create the form
  //use shouldUnregister to unregister the getter fields when the option is not a getter
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    shouldUnregister: false,
  });

  //get the updated fields,which has is_updated_entry set to 1 in EvaluationRules 
  const updatedFields = useMemo(
    () =>
      evaluationRules
        ?.filter((rule) => rule.is_updated_entry === 1)
        .map(
          (rule) =>
            `${rule.evaluation_rule_slug}#${rule.evaluation_rule_id}`,
        ) ?? [],
    [evaluationRules],
  );

  useEffect(() => {
    form.reset(initialValues);
    setCopiedFields(initialCopiedValues);
  }, [form, initialValues, initialCopiedValues]);

  function copyBrokerDefaults(name: string) {
    const rule = evaluationRules?.find(
      (r) =>
        `${r.evaluation_rule_slug}#${r.evaluation_rule_id}` === name,
    );
    if (!rule) return;

    const getterName = `${name}_getter`;
    const optionId = String(rule.evaluation_option_id ?? "");

    const selectedOption = fields[name]?.options.find(
      (o) => String(o.value) === optionId,
    );

    if (selectedOption?.is_getter == 1) {
      const type = selectedOption.getter_type ?? "string";
      if (type === "string_array") {
        const parsedArray =
          rule.details
            ?.replace(/^#-#|#-#$/, "")
            ?.split("#-#")
            .filter(Boolean) ?? [];
        form.unregister(getterName);
        form.clearErrors(getterName);
        form.setValue(name, optionId);
        form.setValue(
          getterName,
          parsedArray.length > 0 ? parsedArray : [""],
          { shouldDirty: true, shouldValidate: true },
        );
      } else {
        form.setValue(name, optionId);
    
        form.setValue(getterName, rule.details ?? "", { shouldDirty: true });
       
      }
    } else {
      form.setValue(name, optionId);
      form.unregister(getterName);
      form.clearErrors(getterName);
    }

    setCopiedFields((prev) => {
      const next = new Set(prev);
      next.add(name);
  
      return [...next];
    });
  }

  const onSubmit =async (data: z.infer<typeof formSchema>) => {
    const saveEvaluationRulesUrl = "/evaluation-rules/" + brokerId;

   
    const normalize = (v: string | number | null) =>
      v === "" || v === "_none_" ? null : v;
    const dataToSend: Record<string, string | number | null> = {};
    //send only the options ids and getter values to the server
    for (const [name] of Object.entries(fields)) {
      let normalizedValue = normalize(data[name]);
      //if the value is null, skip the field, do not send it to the server
      if(normalizedValue ===null){
        //for the moment keep saving empty values 
        //continue;
      }
        dataToSend[name] = normalizedValue;
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
    const isUpdated = updatedFields.includes(name);
    const isCopied = copiedFields.includes(name);

    const evaluationRule = evaluationRules?.find(
      (r) =>
        `${r.evaluation_rule_slug}#${r.evaluation_rule_id}` === name,
    );
    const previousValues = evaluationRule?.previous_evaluation_options;
    const previousGetterValues = evaluationRule?.previous_details;
   // const brokerValue = evaluationRule?.evaluation_option_value;
    //check if broker value is a getter
    const isBrokerGetter = evaluationRule?.is_getter == 1;
    const brokerValue = isBrokerGetter ? evaluationRule?.evaluation_option_value+" => Is Getter" : evaluationRule?.evaluation_option_value;
    const brokerGetterValue = evaluationRule?.details;
   
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
      {is_admin && (
        <>
        <BrokerValue
          value={brokerValue ?? ""}
          label="Broker Value"
        />
        <PreviousValues
          previousValues={previousValues}
          label="Previous Value"
        />
        </>
      )}
     
      {showGetter && getterType === "string" && (
        <Controller
          control={form.control}
          name={`${name}_getter`}
          render={({ field,fieldState }) => (
            <Field className="mt-2" aria-invalid={fieldState.invalid}>
             
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
            <Field className="mt-2" aria-invalid={fieldState.invalid}>
             
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
        <StringArrayGetterField2
          name={name}
          control={form.control}
          placeholder={getterPlaceholder}
        />
      )}

      {is_admin && brokerGetterValue && (
      
        <BrokerValue
          value={brokerGetterValue ?? ""}
          label="Broker Getter Value"
        />)}
        {is_admin && previousGetterValues && (
        <PreviousValues
          previousValues={previousGetterValues}
          label="Previous Getter Value"
        />
        
      )}

      {is_admin && (isUpdated || isCopied) && (
        <div className="mt-2 flex w-full justify-end">
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" 
            variant="outline" 
            size="icon-sm"
             className={cn(
              "shrink-0",
              isCopied &&
                "border-green-500 text-green-600 hover:bg-green-50",
              isUpdated &&
                !isCopied &&
                "border-red-500 text-red-600 hover:bg-red-50",
            )}
            title="Copy broker defaults"
            aria-label="Copy broker defaults"
            onClick={() => {
              copyBrokerDefaults(name);
            }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      </>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-gray-100">
              Evaluation Rules
            </h1>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Configuration & Settings
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 md:grid-cols-2">
        {Object.entries(fields).map(([name, fieldConfig]) => (
          <div
            key={name}
            className={cn(
              "h-full rounded-lg border p-4",
              is_admin &&
                updatedFields.includes(name) &&
                "border-red-500",
              is_admin &&
                copiedFields.includes(name) &&
                !updatedFields.includes(name) &&
                "border-green-500",
            )}
          >
            {renderField(name, fieldConfig)}
          </div>
        ))}
      </div>
      <div className="my-8 flex justify-end">
        <Button
          type="submit"
          className="min-w-28 border border-green-700 bg-green-600 text-white hover:bg-green-700"
          onClick={() => {
            thisLogger.info("Form values before validation", {
              context: { values: form.getValues() },
            });
          }}
        >
          Save
        </Button>
      </div>
    </form>
    </div>
  );
}
