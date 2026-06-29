import { EvaluationFormConfig, EvaluationRule } from "./types";
import { getFormFields } from "./getFormFields";
import { z } from "zod";

type EvaluationFormValues = Record<string, string | number | Array<string> | null>;

// Example of a broker evaluation rule(a processed row from broker_evaluations table) received from server:
//   {
//     "id": 1,
//     "broker_id": 181,
//     "zone_id": null,
//     "evaluation_rule_id": 1,
//     "evaluation_option_id": 2,
//     "public_evaluation_option_id": null,
//     "details": null,
//     "public_details": null,
//     "previous_evaluation_option_id": null,
//     "previous_evaluation_option_value": null,
//     "previous_details": null,
//     "evaluation_rule_slug": "copy-trading",
//     "evaluation_option_value": "not-allowed",
//     "is_getter": 0,
//     "is_getter_for_admin": 0,
//     "is_updated_entry": 0,
//     "created_at": null,
//     "updated_at": "2026-03-20T12:47:25.000000Z"
// },

export default function buildDefaultFormValues(is_admin: boolean, formConfig: EvaluationFormConfig, evaluationRules: EvaluationRule[]) {


    const defaultValues: EvaluationFormValues = {};
    const zodSchema: Record<string, z.ZodTypeAny> = {};
  

    for (const [name, fieldConfig] of Object.entries(getFormFields(formConfig))) {
        const ruleObject = getRuleData(name, evaluationRules);
        const getterName = name + "_getter";
        // if(fieldConfig.required == true){
        //     zodSchema[name] = z.string();
        // }else{
        //     zodSchema[name] = z.string().optional();
        // }


        if (is_admin) {
            defaultValues[name] = String(ruleObject?.public_evaluation_option_id ?? "");
            if (ruleObject?.is_getter_for_admin == 1) {
                if (ruleObject.public_getter_type === "string" || ruleObject.public_getter_type === "textarea") {
                    defaultValues[getterName] = ruleObject?.public_details ?? "";
                   // zodSchema[getterName] = z.string();
                } else if (ruleObject.public_getter_type === "string_array") {
                    defaultValues[getterName] = ruleObject?.public_details?.replace(/^#-#|#-#$/, "") ?.split("#-#") ?? []
                   // zodSchema[getterName] = z.array(z.string());
                }
            }

        } else {
            defaultValues[name] = String(ruleObject?.evaluation_option_id ?? "");
            if (ruleObject?.is_getter == 1) {
                if (ruleObject.getter_type === "string" || ruleObject.getter_type === "textarea") {
                    defaultValues[getterName] = ruleObject?.details ?? "";
                    zodSchema[getterName] = z.string();
                } else if (ruleObject.getter_type === "string_array") {
                    defaultValues[getterName] = ruleObject?.details?.replace(/^#-#|#-#$/, "") ?.split("#-#") ?? []
                    //zodSchema[getterName] = z.array(z.string());
                }
            }
        }


    }
    return defaultValues;
}

function getRuleData(ruleID: string, evaluationRules: EvaluationRule[]) {
    return evaluationRules.find((rule) => rule.evaluation_rule_slug + "#" + rule.evaluation_rule_id === ruleID);
}