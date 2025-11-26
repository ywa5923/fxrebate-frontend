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
import { XFormDefinition } from "@/components/XForm/types";

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
  formDefinition: XFormDefinition;
  formData?: any;
}
export default function XForm( { formDefinition, formData }: XFormProps) 
{

  //generate form schema from formDefinition
  if (!formDefinition) {
    throw new Error("Form definition is required");
  }
  
  const formSchema = getFormSchema(formDefinition);
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
         <div>
                  <h1>XForm</h1>
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        {Object.entries(formDefinition.sections ?? {}).map(([sectionKey, section]: [string, any]) => {
                          return (
                            <FieldSet key={sectionKey}>
                            <FieldLegend>{sectionKey.toUpperCase()}</FieldLegend>
                            <FieldDescription>
                              {section?.description ?? "No description available"}
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
                        <Button type="submit">Submit form</Button>
                      
                      </form>
                 </Form>
          </div>
         );
    
 }
