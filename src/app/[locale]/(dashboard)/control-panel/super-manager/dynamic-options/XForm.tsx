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
import { FormBase, FormSelect, FormCheckbox, FormInput, FormTextarea, FormNumber } from "@/components/XForm/form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ArrayFields } from "@/components/XForm/form";

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

export default function XForm(
  { formDefinition, formData }: { formDefinition?: any; formData?: any } = {}
) {
    
  //generate form schema from formDefinition
  if (!formDefinition) {
    return <div>No form definition</div>;
  }
  //const formSchema = generateXFormSchema(formDefinition);
  const formSchema = getFormSchema(formDefinition);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'applicability.applicable_for':'account_type'
    },
  });
 
  console.log("from sections", formDefinition.sections);
  //const formSchema = z.object();





  const onSubmit = (data: any) => {
    console.log(data);
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
                                    
                                     case "array_field":
                                      return <ArrayFields key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} fieldDef={f} />
                                    default:
                                      return null;
                                  }
                                })}
                            </FieldGroup>
                            </FieldSet>
                          );
                        })}
                      </form>
                 </Form>
          </div>
         );
    
 }
