import { Option } from "@/types";
import { isValidUrl } from "@/lib/isValidUrl";
import { z } from "zod";

const YEAR_ONLY_REGEX = /^\d{4}$/;
const FULL_DATE_REGEX =
  /^\d{4}[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])$/;

function isValidDateValue(value: string): boolean {
  const trimmed = value.trim();

  if (YEAR_ONLY_REGEX.test(trimmed)) {
    const year = Number(trimmed);
    return year >= 1000 && year <= 9999;
  }

  if (!FULL_DATE_REGEX.test(trimmed)) {
    return false;
  }

  const [year, month, day] = trimmed
    .replace(/[/.]/g, "-")
    .split("-")
    .map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

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

      
      case "date": {
        const dateMessage = `${option.name} must be a year (e.g. 2024) or a date (YYYY-MM-DD)`;

        fieldSchema =
          option.required === 1
            ? z.preprocess(
                (val) =>
                  val === "" || val === null || val === undefined
                    ? null
                    : String(val).trim(),
                z.string().refine(isValidDateValue, { message: dateMessage }),
              )
            : z.preprocess(
                (val) =>
                  typeof val === "string" && val.trim() === ""
                    ? null
                    : val === null || val === undefined
                      ? null
                      : String(val).trim(),
                z
                  .string()
                  .nullable()
                  .optional()
                  .refine((val) => val == null || isValidDateValue(val), {
                    message: dateMessage,
                  }),
              );
        break;
      }

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
            ? z
                .string()
                .trim()
                .min(1, "URL is required")
                .refine(isValidUrl, {
                  message: "Please enter a valid URL (https://example.com/)",
                })
            : z.preprocess(
                (value) =>
                  typeof value === "string" && value.trim() === "" ? null : value,
                z
                  .string()
                  .nullable()
                  .optional()
                  .refine((val) => val == null || isValidUrl(val), {
                    message: "Please enter a valid URL (https://example.com/)",
                  }),
              );
        break;

      default:
        fieldSchema = z.string();
    }

    schemaObject[option.slug] = fieldSchema;
  }

  return z.object(schemaObject);
}