'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getFormSchema } from "@/components/XForm/schema";
import { Form } from "@/components/ui/form";
import {  FormSelect, FormCheckbox, FormInput, FormTextarea, FormNumber } from "@/components/XForm/form-components";

import { ArrayFields } from "@/components/XForm/form-components";
import { FormMultiSelect } from "@/components/XForm/form-multiselect";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {FieldDescription,FieldGroup,FieldLegend, FieldSet} from "@/components/ui/field"

import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XFormDefinition, XFormSection, XFormField, XFormOption } from "@/types";

import { apiClient} from "@/lib/api-client";
import { DynamicOption } from "@/types";

import { toast } from "sonner";
import { useState } from "react";
import { flattenObject } from "@/lib/flattenObject";
import { Loader2 } from "lucide-react";
import logger from "@/lib/logger";


//==============Make default values for the form==============//
/** Select options use "1"/"0"; API may send true/false/1/0/"1"/"0". */
function toSelectValue(value: unknown): string {
  if (value === true || value === 1 || value === "1") return "1";
  if (value === false || value === 0 || value === "0") return "0";
  if (value == null) return "";
  return String(value);
}

//Generate default values for empty form or form with data
function makeDefaultValues<T extends Record<string, any>>(formConfig: XFormDefinition, rowData: T): Record<string, any> {
  const defaultData: Record<string, any> = {};
  Object.entries(formConfig.sections ?? {}).forEach(([sectionKey, section]: [string, XFormSection]) => {
    
    const sectionDefaultValue: Record<string, any> = {};
    Object.entries(section.fields ?? {}).forEach(([fieldKey, f]: [string, XFormField]) => {
      
      let fieldValue = null;
      if (Object.keys(rowData).length > 0) {
        if (f.type === "select") {
          fieldValue = toSelectValue(rowData[fieldKey]);
        } else if (f.type === "array_field" || f.type === "array_fields") {
          //for array_field and array_fields, the rowData[fieldKey] is an array of objects
          
          const rows = Array.isArray(rowData[fieldKey]) ? rowData[fieldKey] : [];
          fieldValue = rows.map((row: Record<string, any>) => {
            const item = { ...row };
            Object.entries(f.fields ?? {}).forEach(([subKey, subField]) => {
              if (subField.type === "select") {
                item[subKey] = toSelectValue(item[subKey]);
              }
            });
            return item;
          });
        } else {
          fieldValue = rowData[fieldKey];
        }
      } else {
        if (f.type === 'checkbox' || f.type === 'boolean') fieldValue = false;
        else if (f.type === 'number') fieldValue = '';
        else if (f.type === 'multiselect') fieldValue = [];
        else if (f.type === 'array_field' || f.type === 'array_fields') fieldValue = [];
        else fieldValue = '';
      }
      sectionDefaultValue[fieldKey] = fieldValue ;
    });
    defaultData[sectionKey] = sectionDefaultValue;
  });
  return defaultData;
}

type XFormProps = {
  getItemUrl?: string;
  formConfig?: XFormDefinition | null;
  formConfigApiUrl?: string;
  resourceId?: number|string;
  resourceName?: string;
  resourceApiUrl: string;
  onSubmitted?: () => void;
  mode?: 'edit' | 'create';
}

export default function XForm({ formConfig,formConfigApiUrl,  resourceId, resourceName,getItemUrl, resourceApiUrl, mode='edit', onSubmitted }: XFormProps) 
{

  const router = useRouter();
  const thisLogger = logger.child('components/XForm/XForm.tsx');

  //let [formDefaultValues, setFormDefaultValues] = useState<Record<string, any>>({});
  let [isLoading, setIsLoading] = useState(false);
  let [formConfigState, setFormConfigState] = useState<XFormDefinition | null>(null);

 
  useEffect(() => {
 
    setIsLoading(true);
    const fetchItem = async () => {
      try {
        if(mode === 'create' ){
         
          let formDefUrl = formConfigApiUrl ?? resourceApiUrl + "/form-config";
          thisLogger.debug("fetching form configuration", {formDefUrl: formDefUrl});
          const response = await apiClient<XFormDefinition>(formDefUrl, true);
          
          if(response.success && response.data){
            setFormConfigState(response.data);
          } else {
            thisLogger.error("Failed to fetch form configuration", {formDefUrl: formDefUrl, message: response.message});
            toast.error("Failed to fetch form configuration");
            
          }
        }


        //in edit mode the formconfig is already fetched in table data fetch, so we need to fetch the item data
        if(mode === 'edit' && formConfig && getItemUrl && resourceId){
          let apiUrl = getItemUrl + "/" + resourceId;
          const response = await apiClient<any>(apiUrl, true);

          if (response.success && response.data) {
            thisLogger.debug("response.data", {responseData: response.data});
            thisLogger.debug("makeDefaultValues(formConfig, response.data as any)", {defaultValues: makeDefaultValues(formConfig, response.data as any)});
            let defaultValues = makeDefaultValues(formConfig, response.data as any);
            requestAnimationFrame(() => form.reset(defaultValues));
          } else {
           thisLogger.error("Failed to fetch item", {apiUrl: apiUrl, message: response.message});
            toast.error("Failed to fetch item");
          }
        }
       
      } catch (err) {
        thisLogger.error("Failed to fetch item", {error: err});
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchItem();
  }, []);
  //resourceId, mode,getItemUrl,formConfig,resourceApiUrl

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
  
   thisLogger.debug("Xform json submitted data", {apiUrl,jsonBody});

   const response = await apiClient<DynamicOption>(apiUrl, true, {
    method: method,
    body: jsonBody,
   });
   if (response.success && response.data) {
   
   
    toast.success(method === 'POST' ? "Item created successfully" : "Item updated successfully");

    router.refresh();

    if(onSubmitted){
      //call the onSubmitted function to cloase the modal form by setting the open state to false
      onSubmitted();
    }
   } else {
   
    toast.error(response.message);
   }
   thisLogger.debug("XFormData", data);
   thisLogger.debug("XFormFlatData", formFlatData);
  }

    return (
         <div className="m-2">
                  {isLoading && (
                    <div className="flex items-center justify-center gap-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-950 dark:to-blue-950/30 p-4 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900">
                      <Loader2 className="h-20 w-20 animate-spin text-blue-200 dark:text-blue-700" />
                      <span className="text-gray-600 dark:text-gray-300 text-lg font-medium tracking-wide">Loading...</span>
                    </div>
                  )}
                 { !isLoading && formConfig && <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit,(errors) => console.log('form errors:', errors))}>
                        {Object.entries(formConfig.sections ?? {}).map(([sectionKey, section]: [string, XFormSection]) => {
                          return (
                            <FieldSet key={sectionKey} className="mb-4 pb-4 p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                            <FieldLegend className="inline-flex items-center gap-2 px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-dashed border-blue-300 dark:border-blue-800 rounded-md">{(section.label ?? sectionKey).toUpperCase()}</FieldLegend>
                            <FieldDescription>
                              {section?.description ?? ""}
                            </FieldDescription>
                            <FieldGroup data-slot="checkbox-group">
                                { section?.fields && Object.entries(section?.fields as Record<string, XFormField>).map(([fieldKey, f]: [string, XFormField]) => {

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
                                        {f.options?.map((option: XFormOption) => {
                                          return <SelectItem key={option.value.toString()} value={option.value.toString()}>{option.label}</SelectItem>
                                        })}
                                      </FormSelect>
                                      case "multiselect":
                                      case "multi-select":
                                        return (
                                          <FormMultiSelect
                                            key={fieldKey}
                                            control={form.control}
                                            name={sectionKey + "." + fieldKey}
                                            label={f?.label}
                                            placeholder={f?.placeholder ?? "Select options"}
                                            required={f?.required}
                                            options={f.options}
                                            searchUrl={f.searchUrl}
                                            searchParamName={f.searchParamName}
                                            debounceMs={f.debounceMs}
                                          />
                                        )
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
                        <div className="flex justify-center items-center mt-3 py-2 bg-gray-50 dark:bg-gray-900/60">

                        <Button disabled={!isDirty ||  isSubmitting} variant="outline" className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 border-green-700 dark:border-green-600 hover:border-green-800 dark:hover:border-green-500 w-full sm:w-auto h-11 text-base font-medium mt-2" type="submit">{resourceId ? "Update" : "Create"} {resourceName}</Button>
                        </div>
                      </form>
                 </Form>
                 }
          </div>
         );
 }
