import { z } from "zod";
import { XFormSection, XFormField, fieldValidation, XFormDefinition } from "@/types";

export function getFormSchema(formConfig: XFormDefinition):z.ZodObject<any> {
   
  const sections = (formConfig.sections ?? {}) as Record<string, XFormSection>;
  const schema: Record<string, z.ZodTypeAny> = {};
  Object.entries(sections).forEach(([sectionKey, section]) => {
    const fieldsSchema = generateFieldsSchema(section.fields ?? {});
    schema[sectionKey] = z.object(fieldsSchema);
   
  });

  return z.object(schema) as z.ZodObject<any>;

}

function generateFieldsSchema(fields: Record<string, XFormField>): Record<string, z.ZodTypeAny> {
    const schema: Record<string, z.ZodTypeAny> = {};
    Object.entries(fields).forEach(([fieldKey, field]: [string, XFormField]) => {
      const validationObject = (field.validation ?? {}) as  fieldValidation;
      
      if (field.type === "text" || field.type === "textarea") {
        schema[fieldKey] = z.string();
      } else if (field.type === "select") {
       // schema[fieldKey] = field.valueType === "string" ? z.string() : z.coerce.number();
        schema[fieldKey] = z.string();
      } else if (field.type === "number") {
        schema[fieldKey] = z.coerce.number();
      } else if (field.type === "boolean" || field.type === "checkbox") {
        schema[fieldKey] = z.boolean();
      } else if (field.type === "date") {
        schema[fieldKey] = z.date();
      } else if ( field.type === "multiselect") {
        schema[fieldKey] = z.array(z.string());
      }else if (field.type=='array_fields') {
        schema[fieldKey] = z.array(z.object(generateFieldsSchema(field.fields ?? {})));
      
      } else {
        schema[fieldKey] = z.any();
      }//end of if/else if/else
      Object.entries(validationObject).forEach(([validationKey, validationValue]:[string, any]) => {
        if (validationKey === "min") {
          let minMessage = validationObject.min_message ?? `${field.label} must be at least ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).min(validationValue, { message: minMessage });
        } else if (validationKey === "max") {
          let maxMessage = validationObject.max_message ?? `${field.label} must be at most ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).max(validationValue, { message: maxMessage });
        }
        if (validationKey === "required" && validationValue=='false') {
          schema[fieldKey] = schema[fieldKey].optional();
        }
        if (validationKey === "gt") {
          let gtMessage = validationObject.gt_message ?? `${field.label} must be greater than ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).gt(validationValue, { message: gtMessage });
        }
        if (validationKey === "lt") {
          let ltMessage = validationObject.lt_message ?? `${field.label} must be less than ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).lt(validationValue, { message: ltMessage });
        }
        if (validationKey === "gte") {
          let gteMessage = validationObject.gte_message ?? `${field.label} must be greater than or equal to ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).gte(validationValue, { message: gteMessage });
        }
        if (validationKey === "lte") {
          let lteMessage = validationObject.lte_message ?? `${field.label} must be less than or equal to ${validationValue}`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).lte(validationValue, { message: lteMessage });
        }
        if (validationKey === "email" && validationValue) {  
          let emailMessage = validationObject.email_message ?? `${field.label} must be a valid email`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodString).email({ message: emailMessage });
        }
        
        if(validationKey === "positive" && validationValue) {   
          let positiveMessage = validationObject.positive_message ?? `${field.label} must be a positive number`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).positive({ message: positiveMessage });
        };

        if(validationKey === "negative" && validationValue) {
          let negativeMessage = validationObject.negative_message ?? `${field.label} must be a negative number`;
          schema[fieldKey] = (schema[fieldKey] as z.ZodNumber).negative({ message: negativeMessage });
        }

    });


    });
    return schema;
}

//------------DEPRECATED------------
export function generateXFormSchema(formDefinition: any):z.ZodObject<any> {
    if (!formDefinition) {
        return z.object({}) as z.ZodObject<any>;
    }
    const schema: Record<string, Record<string, z.ZodTypeAny>> = {};
    const sections = (formDefinition.sections ?? {}) as Record<string, XFormSection>;
    Object.entries(sections).forEach(([sectionKey, section]:[string, XFormSection]) => {
    const fields = (section.fields ?? {}) as Record<string, XFormField>;
       schema[sectionKey] = {};
      Object.entries(fields).forEach(([fieldKey, field]:[string, XFormField]) => {
       const validationObject = (field.validation ?? {}) as  fieldValidation;
      
        if (field.type === "text" || field.type === "textarea" || field.type === "select") {
          schema[sectionKey][fieldKey] = z.string();
           
        } else if (field.type === "number") {
          schema[sectionKey][fieldKey] = z.number();
        } else if (field.type === "boolean" || field.type === "checkbox") {
          schema[sectionKey][fieldKey] = z.boolean();
        } else if (field.type === "date") {
          schema[sectionKey][fieldKey] = z.date();
        } else if ( field.type === "multiselect") {
          schema[sectionKey][fieldKey] = z.array(z.string());
        } else {
          schema[sectionKey][fieldKey] = z.any();
        }//end of if/else if/else
       
        //add validation to the field
        Object.entries(validationObject).forEach(([validationKey, validationValue]:[string, any]) => {
          if (validationKey === "min") {
            let minMessage = validationObject.min_message ?? `${field.label} must be at least ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).min(validationValue, { message: minMessage });
          } else if (validationKey === "max") {
            let maxMessage = validationObject.max_message ?? `${field.label} must be at most ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).max(validationValue, { message: maxMessage });
          }
          if (validationKey === "required" && !validationValue) {
            schema[sectionKey][fieldKey] = schema[sectionKey][fieldKey].optional();
          }
          if (validationKey === "gt") {
            let gtMessage = validationObject.gt_message ?? `${field.label} must be greater than ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).gt(validationValue, { message: gtMessage });
          }
          if (validationKey === "lt") {
            let ltMessage = validationObject.lt_message ?? `${field.label} must be less than ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).lt(validationValue, { message: ltMessage });
          }
          if (validationKey === "gte") {
            let gteMessage = validationObject.gte_message ?? `${field.label} must be greater than or equal to ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).gte(validationValue, { message: gteMessage });
          }
          if (validationKey === "lte") {
            let lteMessage = validationObject.lte_message ?? `${field.label} must be less than or equal to ${validationValue}`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).lte(validationValue, { message: lteMessage });
          }
          if (validationKey === "email" && validationValue) {  
            let emailMessage = validationObject.email_message ?? `${field.label} must be a valid email`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodString).email({ message: emailMessage });
          }
          
          if(validationKey === "positive" && validationValue) {   
            let positiveMessage = validationObject.positive_message ?? `${field.label} must be a positive number`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).positive({ message: positiveMessage });
          };
  
          if(validationKey === "negative" && validationValue) {
            let negativeMessage = validationObject.negative_message ?? `${field.label} must be a negative number`;
            schema[sectionKey][fieldKey] = (schema[sectionKey][fieldKey] as z.ZodNumber).negative({ message: negativeMessage });
          }
  
      });
    });
    });
    let formSchema: Record<string, z.ZodObject<any>> = {};
    for (const sectionKey in schema) {
        formSchema[sectionKey] = z.object(schema[sectionKey]);
    }
    return z.object(formSchema);
}

