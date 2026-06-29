import {
  EvaluationFields,
  EvaluationFormConfig,
} from "./types";

/** Fields live under sections in API config; top-level fields is a fallback. */
export function getFormFields(formConfig: EvaluationFormConfig): EvaluationFields {
  if (formConfig.fields && Object.keys(formConfig.fields).length > 0) {
    return formConfig.fields;
  }

  const firstSection = Object.values(formConfig.sections ?? {})[0];
  return firstSection?.fields ?? {};
}
