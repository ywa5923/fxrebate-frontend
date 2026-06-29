import { EvaluationFormConfig } from "./types";
import { getFormFields } from "./getFormFields";
import { z } from "zod";

export default function getFormSchema(formConfig: EvaluationFormConfig) {
    const schema: Record<string, z.ZodTypeAny> = {};
    for (const [name, fieldConfig] of Object.entries(getFormFields(formConfig))) {
        if (fieldConfig.required == true) {
            schema[name] =  z.string().trim().min(1, { message: "This field is required" });
        } else {
            schema[name] = z.string().nullable();
        }
        const hasGetter = fieldConfig.options.some(option => option.is_getter == 1);
        if (hasGetter) {
            schema[name + "_getter"] = z
                .union([
                    z.string().trim().min(1, { message: "This field is required" }),
                    z
                        .array(z.string().trim().min(1, { message: "Item cannot be empty" }))
                        .min(1, { message: "Please select at least one item" }),
                ])
                .optional();
        }
    }
    return z.object(schema) as z.ZodObject<any>;
}