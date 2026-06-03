import { Option } from "@/types";
import { z } from "zod";

export function buildFormSchema(options: Option[]) {
    const schemaObject: { [key: string]: any } = {};
  
    for (const option of options) {
      if (option.form_type === "numberWithUnit") {
        schemaObject[option.slug] =
          option.required === 1
            ? z.object({
                value: z.number(),
                unit: z.string(),
              })
            : z
                .object({
                  value: z.number(),
                  unit: z.string(),
                })
                .nullable()
                .optional();
  
        continue;
      }
  
      if (option.form_type === "image") {
        schemaObject[option.slug] =
          option.required === 1
            ? z.instanceof(File).or(z.string())
            : z.instanceof(File).or(z.string()).nullable().optional();
  
        continue;
      }
  
      let fieldSchema;
  
      switch (option.form_type) {
        case "number": {
          let numberSchema = z.number();
  
          if (option.min_constraint) {
            numberSchema = numberSchema.min(
              option.min_constraint,
              `${option.name} must be at least ${option.min_constraint}`,
            );
          }
  
          if (option.max_constraint) {
            numberSchema = numberSchema.max(
              option.max_constraint,
              `${option.name} must be at most ${option.max_constraint}`,
            );
          }
  
          fieldSchema =
            option.required === 1
              ? z.preprocess(
                  (val) => (val === "" ? null : Number(val)),
                  numberSchema,
                )
              : z.preprocess(
                  (val) =>
                    val === "" || val === null || val === undefined
                      ? null
                      : Number(val),
                  numberSchema.nullable().optional(),
                );
  
          break;
        }
  
        case "checkbox":
          fieldSchema =
            option.required === 1
              ? z.preprocess(
                  (val) =>
                    val === null || val === undefined ? false : Boolean(val),
                  z.boolean(),
                )
              : z.preprocess(
                  (val) =>
                    val === null || val === undefined ? null : Boolean(val),
                  z.boolean().nullable().optional(),
                );
          break;
  
        case "string":
        case "textarea": {
          let baseString = z.string();
  
          if (option.min_constraint) {
            baseString = baseString.min(
              option.min_constraint,
              `${option.name} must be at least ${option.min_constraint} characters`,
            );
          }
  
          if (option.max_constraint) {
            baseString = baseString.max(
              option.max_constraint,
              `${option.name} must be at most ${option.max_constraint} characters`,
            );
          }
  
          if (option.required === 1) {
            const minValue = option.min_constraint ?? 1;
            baseString = baseString.min(minValue, `${option.name} is required`);
  
            fieldSchema = z.preprocess(
              (val) => (val === "" ? null : val),
              baseString,
            );
          } else {
            fieldSchema = z.preprocess(
              (val) => (val === "" ? null : val),
              baseString.nullable().optional(),
            );
          }
  
          break;
        }
  
        case "multiple_select":
          fieldSchema =
            option.required === 1
              ? z.preprocess(
                  (val) => {
                    if (val === null || val === undefined) return [];
                    if (Array.isArray(val)) return val;
                    return [];
                  },
                  z
                    .array(z.string())
                    .min(1, `Please select at least one ${option.name}`),
                )
              : z.preprocess((val) => {
                  if (val === null || val === undefined) return [];
                  if (Array.isArray(val)) return val;
                  return [];
                }, z.array(z.string()).optional());
          break;
  
        case "notes":
          fieldSchema =
            option.required === 1
              ? z.preprocess(
                  (val) => {
                    if (val === null || val === undefined) return [];
                    if (Array.isArray(val)) return val;
                    return [];
                  },
                  z
                    .array(z.string().min(1, "Note cannot be empty"))
                    .min(1, `Please enter at least one ${option.name}`),
                )
              : z.preprocess((val) => {
                  if (val === null || val === undefined) return [];
                  if (Array.isArray(val)) return val;
                  return [];
                }, z.array(z.string()).optional());
          break;
  
        case "url":
          fieldSchema =
            option.required === 1
              ? z.string().min(1, "URL is required").url({
                  message: "Invalid URL",
                })
              : z.string().url({ message: "Invalid URL" }).nullable().optional();
          break;
  
        default:
          fieldSchema = z.string();
      }
  
      schemaObject[option.slug] = fieldSchema;
    }
  
    return z.object(schemaObject);
  }