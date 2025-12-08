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
import { useRouter } from "next/navigation";
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
import { XFormDefinition, XFormSection, XFormField } from "@/types";
import { inspectZodObject } from "@/lib/inspectZodObject";
import { apiClient, apiClientPut } from "@/lib/api-client";
import { DynamicOption } from "@/types";

import { BASE_URL } from "@/constants";
import { toast } from "sonner";
import { useState } from "react";
import { flattenObject } from "@/lib/flattenObject";
import { Loader2 } from "lucide-react";
import logger from "@/lib/logger";

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

function makeDefaultValues(formConfig: XFormDefinition, rowData: Record<string, any>): Record<string, any> {
  const defaultData: Record<string, any> = {};
  Object.entries(formConfig.sections ?? {}).forEach(([sectionKey, section]: [string, XFormSection]) => {
    
    const sectionDefaultValue: Record<string, any> = {};
    Object.entries(section.fields ?? {}).forEach(([fieldKey, f]: [string, XFormField]) => {
      
      let fieldValue = null;
      if(Object.keys(rowData).length > 0){
        fieldValue = (f.type =='select' && rowData[fieldKey] !== undefined && rowData[fieldKey] !== null)? (rowData[fieldKey]).toString(): rowData[fieldKey];
      }else{
        if (f.type === 'checkbox' || f.type === 'boolean') fieldValue = false;
      else if (f.type === 'number') fieldValue = '';
      else if (f.type === 'multiselect') fieldValue = [];
      else if (f.type === 'array_field' || f.type === 'array_fields') fieldValue = Array.isArray(fieldValue) ? fieldValue : [];
      else fieldValue = '';
      }

    
      sectionDefaultValue[fieldKey] = fieldValue ;
      //defaultData[sectionKey + "." + fieldKey] = rowData[fieldKey] ?? defaultValue;
      
    });
    defaultData[sectionKey] = sectionDefaultValue;
  });
  return defaultData;
}

type XFormProps = {
  getItemUrl?: string;
  formConfig?: XFormDefinition | null;
  resourceId?: number|string;
  resourceName?: string;
  resourceApiUrl: string;
  onSubmitted?: () => void;
  mode?: 'edit' | 'create';
}

export default function XForm( { formConfig,  resourceId, resourceName,getItemUrl, resourceApiUrl, mode='edit', onSubmitted }: XFormProps) 
{

  const router = useRouter();
  const log = logger.child('components/XForm/XForm.tsx');

  //let [formDefaultValues, setFormDefaultValues] = useState<Record<string, any>>({});
  let [isLoading, setIsLoading] = useState(false);
  let [formConfigState, setFormConfigState] = useState<XFormDefinition | null>(null);

 
  useEffect(() => {
   
    setIsLoading(true);
    const fetchItem = async () => {
      try {
        if(mode === 'create' ){
          let formConfigApiUrl = resourceApiUrl + "/form-config";
         
          const response = await apiClient<XFormDefinition>(formConfigApiUrl, true);
          
          if(response.success && response.data){
            setFormConfigState(response.data);
          } else {
            console.error("Failed to fetch form configuration", response.message);
            toast.error("Failed to fetch form configuration");
            
          }
        }


        if(mode === 'edit' && formConfig && getItemUrl && resourceId){
          let apiUrl = getItemUrl + "/" + resourceId;
          const response = await apiClient<DynamicOption>(apiUrl, true);

          if (response.success && response.data) {
            console.log("response.data", response.data);
            console.log("makeDefaultValues(formConfig, response.data as any)", makeDefaultValues(formConfig, response.data as any));
            form.reset(makeDefaultValues(formConfig, response.data as any));
          } else {
            console.error("Failed to fetch item", response.message);
            toast.error("Failed to fetch item");
          }
        }
       
      } catch (err) {
        console.error("Failed to fetch item", err);
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchItem();
  }, [resourceId, getItemUrl,resourceApiUrl]);

  if(mode === 'create'){
    formConfig = formConfigState;
  }

  let formSchema: z.ZodSchema<any> | null = null;
  if(formConfig){
    formSchema = getFormSchema(formConfig);
  }else{
    formSchema = z.object({}) as z.ZodSchema<any>;
  }
  
  //==============Inspect the form schema==============
  //console.log(JSON.stringify(inspectZodObject(formSchema), null, 2));

  let defaultValues;
  if(formConfig){
    defaultValues = makeDefaultValues(formConfig, {});
  }
 
  //console.log("formSchema", formSchema);
  //console.log("defaultValues", defaultValues);
 const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
   
    defaultValues:  defaultValues??{},
  });
 
  const { isDirty, isValid, isSubmitting } = form.formState;
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    //if second param is true, it will skip empty values si empty values are not sent to the server
   let formFlatData = flattenObject(data);
   let apiUrl : string;
   let method : string;
   if(mode === 'create'){
    apiUrl = resourceApiUrl;
    method = 'POST';
   }else{
    apiUrl = resourceApiUrl + "/" + resourceId;
    method = 'PUT';
   }
   
  
   let jsonBody= JSON.stringify(formFlatData,(_k, v) => (v === undefined ? null : v));
  
   log.debug("json stringify data", {jsonBody});

   const response = await apiClient<DynamicOption>(apiUrl, true, {
    method: method,
    body: jsonBody,
   });
   if (response.success && response.data) {
   
    if(onSubmitted){
      //call the onSubmitted function to cloase the modal form by setting the open state to false
      onSubmitted();
    }
    toast.success(method === 'POST' ? "Item created successfully" : "Item updated successfully");

    router.refresh();
   } else {
   
    toast.error(response.message);
   }
   console.log("XFormData", data);
   console.log("XFormFlatData", formFlatData);
  }

    return (
         <div className="m-2">
                  <h1 className="text-2xl font-bold mb-4">XForm</h1>
                  {isLoading && (
                    <div className="flex items-center justify-center gap-3 rounded-lg border border-blue-100 bg-gradient-to-r from-white to-blue-50/50 p-4 shadow-sm ring-1 ring-blue-100">
                      <Loader2 className="h-20 w-20 animate-spin text-blue-200" />
                      <span className="text-grey-100 text-lg font-medium tracking-wide">Loading...</span>
                    </div>
                  )}
                 { !isLoading && formConfig && <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit,(errors) => console.log('form errors:', errors))}>
                        {Object.entries(formConfig.sections ?? {}).map(([sectionKey, section]: [string, any]) => {
                          return (
                            <FieldSet key={sectionKey} className="mb-4 pb-4 p-5 border-2 border-dashed border-grey-300 rounded-md">
                            <FieldLegend className="inline-flex items-center gap-2 px-3 py-1.5  hover:bg-blue-100 text-blue-700 border border-dashed border-blue-300 rounded-md">{section.label.toUpperCase()}</FieldLegend>
                            <FieldDescription>
                              {section?.description ?? ""}
                            </FieldDescription>
                            <FieldGroup data-slot="checkbox-group">
                                {Object.entries(section?.fields ?? {}).map(([fieldKey, f]: [string, any]) => {

                                  switch (f?.type) {
                                    case "text":
                                      return <FormInput key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} required={f?.required} />
                                    case "textarea":
                                      return <FormTextarea key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey } label={f?.label} required={f?.required} />
                                    case "checkbox":
                                      return <FormCheckbox key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey } label={f?.label} required={f?.required} />
                                    case "number":
                                      return <FormNumber key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} required={f?.required} />
                                    case "select":
                                      return <FormSelect key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} label={f?.label} placeholder={f?.placeholder ?? "Select an option"} required={f?.required}>
                                        {f.options.map((option: {value: string|number, label: string}) => {
                                          return <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                                        })}
                                      </FormSelect>
                                    
                                     case "array_fields":
                                      return <ArrayFields key={fieldKey} control={form.control} name={sectionKey + "." + fieldKey} fieldDef={f} required={f?.required} />
                                    default:
                                      return null;
                                  }
                                })}
                            </FieldGroup>
                            </FieldSet>
                          );
                        })}
                        <div className="flex justify-center items-center mt-3 py-2 bg-gray-50">

                        <Button disabled={!isDirty ||  isSubmitting} variant="outline" className="text-green-700 hover:text-green-800 border-green-700 hover:border-green-800 w-full sm:w-auto h-11 text-base font-medium mt-2" type="submit">{resourceId ? "Update" : "Create"} {resourceName}</Button>
                        </div>
                      </form>
                 </Form>
                 }
          </div>
         );
    
 }
