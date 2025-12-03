import { z } from "zod";
import { XFormSection, XFormField, fieldValidation, XFormDefinition } from "@/types";
import { SelectIteNoneValue } from "./form-components";

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

    const validationObject = (field.validation ?? {}) as fieldValidation;
    
    let baseSchema: z.ZodTypeAny;
    
    if (field.type === "text" || field.type === "textarea") {
      baseSchema = z.string();
    } else if (field.type === "select") {
     // baseSchema = field.valueType === "string" ? z.string() : z.coerce.number();
     baseSchema = z.string();
    } else if (field.type === "number") {
      baseSchema = z.coerce.number();
    } else if (field.type === "boolean" || field.type === "checkbox") {
      baseSchema = z.boolean();
    } else if (field.type === "date") {
      baseSchema = z.date();
    } else if (field.type === "multiselect") {
      baseSchema = z.array(z.string());
    } else if (field.type === 'array_fields') {
      baseSchema = z.array(z.object(generateFieldsSchema(field.fields ?? {})));
    } else {
      baseSchema = z.any();
    }

    // Apply validations to base schema
    Object.entries(validationObject).forEach(([validationKey, validationValue]: [string, any]) => {
      if (validationKey === "min") {
        const minVal = Number(validationValue);
        const minMessage = validationObject.min_message ?? `${field.label} must be at least ${minVal}`;
        if (field.type === 'number') {
          baseSchema = (baseSchema as z.ZodNumber).min(minVal, { message: minMessage });
        } else if (field.type === 'text' || field.type === 'textarea' ) {
          baseSchema = (baseSchema as z.ZodString).min(minVal, { message: minMessage + ' characters long' });
        }
      } else if (validationKey === "max") {
        const maxVal = Number(validationValue);
        const maxMessage = validationObject.max_message ?? `${field.label} must be at most ${maxVal}`;
        if (field.type === 'number' ) {
          baseSchema = (baseSchema as z.ZodNumber).max(maxVal, { message: maxMessage });
        } else if (field.type === 'text' || field.type === 'textarea' ) {
          baseSchema = (baseSchema as z.ZodString).max(maxVal, { message: maxMessage });
        }
      }
      
      if (validationKey === "gt") {
        let gtMessage = validationObject.gt_message ?? `${field.label} must be greater than ${validationValue}`;
        baseSchema = (baseSchema as z.ZodNumber).gt(validationValue, { message: gtMessage });
      }
      if (validationKey === "lt") {
        let ltMessage = validationObject.lt_message ?? `${field.label} must be less than ${validationValue}`;
        baseSchema = (baseSchema as z.ZodNumber).lt(validationValue, { message: ltMessage });
      }
      if (validationKey === "gte") {
        let gteMessage = validationObject.gte_message ?? `${field.label} must be greater than or equal to ${validationValue}`;
        baseSchema = (baseSchema as z.ZodNumber).gte(validationValue, { message: gteMessage });
      }
      if (validationKey === "lte") {
        let lteMessage = validationObject.lte_message ?? `${field.label} must be less than or equal to ${validationValue}`;
        baseSchema = (baseSchema as z.ZodNumber).lte(validationValue, { message: lteMessage });
      }
      if (validationKey === "email" && validationValue) {  
        let emailMessage = validationObject.email_message ?? `${field.label} must be a valid email`;
        baseSchema = (baseSchema as z.ZodString).email({ message: emailMessage });
      }
      
      if (validationKey === "positive" && validationValue) {   
        let positiveMessage = validationObject.positive_message ?? `${field.label} must be a positive number`;
        baseSchema = (baseSchema as z.ZodNumber).positive({ message: positiveMessage });
      }

      if (validationKey === "negative" && validationValue) {
        let negativeMessage = validationObject.negative_message ?? `${field.label} must be a negative number`;
        baseSchema = (baseSchema as z.ZodNumber).negative({ message: negativeMessage });
      }
    });

    // Apply optional AFTER all other validations
    if (validationObject?.required === false) {
      baseSchema = baseSchema.optional();
    }

    //baseSchema = baseSchema.optional();
    // Apply preprocessing for string types at the very end
    //empty inputs send empty string to the server, so we need to convert it to undefined to be rejected by the required validation
    //empty string are converted to 0 when use z.coerce.number()
    //z.string() also accept empty string, so we need to convert it to undefined to be rejected by the required validation
    if (field.type === "text" || field.type === "textarea" || 
        field.type === "select" ||field.type ==="number") {
      baseSchema = preprocessEmptyString(baseSchema as z.ZodTypeAny);
    }

    schema[fieldKey] = baseSchema;
  });
  
  return schema;
}



function preprocessEmptyString(schema: z.ZodTypeAny) {
  return z.preprocess(
    val => (val === "" || val === SelectIteNoneValue || val === null ? undefined : val),
    schema
  )
}

