'use client';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
//import { generateXFormSchema } from "@/components/XForm/schema";
import { getFormSchema } from "@/components/XForm/schema";
import { Form } from "@/components/ui/form";
import { FormBase, FormSelect, FormCheckbox, FormInput, FormTextarea, FormNumber } from "@/components/XForm/form-components";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ArrayFields } from "@/components/XForm/form-components";
import { useEffect } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XFormDefinition } from "@/types";

import { BASE_URL } from "@/constants";
function buildDefaultValues(def: XFormDefinition, data?: any) {
  const out: Record<string, any> = { ...(data ?? {}) };
  const sections = def.sections ?? {};
  for (const [sectionKey, section] of Object.entries(sections)) {
    const secDefaults: Record<string, any> = { ...(out[sectionKey] ?? {}) };
    for (const [fieldKey, f] of Object.entries(section.fields ?? {})) {
      if (secDefaults[fieldKey] !== undefined) continue;
      if (f.type === 'checkbox' || f.type === 'boolean') secDefaults[fieldKey] = false;
      else if (f.type === 'number') secDefaults[fieldKey] = '';
      else if (f.type === 'multiselect') secDefaults[fieldKey] = [];
      else if (f.type === 'array_field' || f.type === 'array_fields') secDefaults[fieldKey] = Array.isArray(secDefaults[fieldKey]) ? secDefaults[fieldKey] : [];
      else secDefaults[fieldKey] = '';
    }
    out[sectionKey] = secDefaults;
  }
  return out;
}

type XFormProps = {
  formConfig: XFormDefinition;
  formData?: any;
  resourceId?: number|string;
  resourceName?: string;
  resourceApiUrl?: string;
}
export default function XForm( { formConfig, formData, resourceId, resourceName, resourceApiUrl }: XFormProps) 
{

  //generate form schema from formDefinition
  if (!formConfig) {
    throw new Error("Form definition is required");
  }

  useEffect(() => {
    if (resourceId) {
     let apiUrl=BASE_URL + resourceApiUrl + "/" + resourceId;
    }
  }, [resourceId]);
  
  const formSchema = getFormSchema(formConfig);
  console.log("formSchema is aaaaa: ",  formSchema)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'firstRow.name':'',
      'firstRow.slug':'',
      'applicability.applicable_for':'account_type',
      'applicability.for_crypto': 1 ,
      'applicability.for_brokers': 0 ,
      'applicability.for_props': 0 ,
      'applicability.test_array':[{'field_name':'aaqa','field_slug':'aaqa'}],
    },
  });
 


  const onSubmit = (data: any) => {
    console.log("form data is aaaaa: ", data);
  }

    return (
         <div className="m-2">
                  <h1>XForm</h1>
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        {Object.entries(formConfig.sections ?? {}).map(([sectionKey, section]: [string, any]) => {
                          return (
                            <FieldSet key={sectionKey}>
                            <FieldLegend>{sectionKey.toUpperCase()}</FieldLegend>
                            <FieldDescription>
                              {section?.description ?? ""}
                            </FieldDescription>
                            <FieldGroup data-slot="checkbox-group">
                                {Object.entries(section?.fields ?? {}).map(([fieldKey, f]: [string, any]) => {

                                  switch (f?.type) {
                                    case "text":
                                      return <FormInput key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} />
                                    case "textarea":
                                      return <FormTextarea key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey } label={f?.label} />
                                    case "checkbox":
                                      return <FormCheckbox key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey } label={f?.label} />
                                    case "number":
                                      return <FormNumber key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} />
                                    case "select":
                                      return <FormSelect key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} placeholder={f?.placeholder ?? "Select an option"}>
                                        {f.options.map((option: {value: string, label: string}) => {
                                          return <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        })}
                                      </FormSelect>
                                    
                                     case "array_fields":
                                      return <ArrayFields key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} fieldDef={f} />
                                    default:
                                      return null;
                                  }
                                })}
                            </FieldGroup>
                            </FieldSet>
                          );
                        })}
                        <div className="flex justify-center items-center mt-3 py-2 bg-gray-50">

                        <Button variant="outline" className="text-green-700 hover:text-green-800 border-green-700 hover:border-green-800 w-full sm:w-auto h-11 text-base font-medium mt-2" type="submit">{resourceId ? "Update" : "Create"} {resourceName}</Button>
                        </div>
                      </form>
                 </Form>
          </div>
         );
    
 }
