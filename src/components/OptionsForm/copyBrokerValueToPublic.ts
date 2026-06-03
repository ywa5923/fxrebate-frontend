import { type Dispatch, type SetStateAction } from "react";
import { Option, OptionValue } from "@/types";
import { UseFormReturn } from "react-hook-form";

type Params = {
  optionSlug: string;
  originalOptionsValues: OptionValue[];
  options: Option[];
  form: UseFormReturn<any>;
  setOriginalOptionsValues: Dispatch<SetStateAction<OptionValue[]>>;
  setIsFormDirty: Dispatch<SetStateAction<boolean>>;
};

export function copyBrokerValueToPublic({
  optionSlug,
  originalOptionsValues,
  options,
  form,
  setOriginalOptionsValues,
  setIsFormDirty,
}: Params) {
  const optionValue = originalOptionsValues.find(
    (optionValue) => optionValue.option_slug === optionSlug
  );

  if (!optionValue) return;

  const option = options.find((option) => option.slug === optionSlug);

  if (option?.form_type === "numberWithUnit") {
    form.setValue(optionSlug, {
      value: parseFloat(optionValue.value) || 0,
      unit: optionValue.metadata?.value?.unit || "",
    });
  } else if (option?.form_type === "multiple_select") {
    form.setValue(optionSlug, optionValue.value?.split("; "));
  } else if (option?.form_type === "notes") {
    form.setValue(optionSlug, optionValue.value?.split("; "));
  } else if (option?.form_type === "checkbox") {
    form.setValue(optionSlug, optionValue.value === "1");
  } else {
    form.setValue(optionSlug, optionValue.value);
  }

  setOriginalOptionsValues((prev) =>
    prev.map((ov) =>
      ov.option_slug === optionSlug
        ? { ...ov, is_updated_entry: false }
        : ov
    )
  );

  setIsFormDirty(true);
}

//  // Helper function to copy broker value to public value
//  const copyBrokerToPublic = (optionSlug: string) => {
//     const optionValue = originalOptionsValues.find(
//       (optionValue) => optionValue.option_slug === optionSlug,
//     );
//     if (optionValue) {
//       //if admin =true, the form value is public_value, otherwise it is value
//       //so for admin set the form field with the optionValue's value

//       // Update the form field with the broker value
//       let option = options.find((option) => option.slug === optionSlug);
//       let isMultiSelect = option?.form_type === "multiple_select";
//       let isCheckbox = option?.form_type === "checkbox";
//       let isNotes = option?.form_type === "notes";
   
//       let isNumberWithUnit = option?.form_type === "numberWithUnit";
//       if (isNumberWithUnit) {
//         // For numberWithUnit, set both value and unit
//         form.setValue(optionSlug, {
//           value: parseFloat(optionValue.value) || 0,
//           unit: optionValue.metadata?.value?.unit || "",
//         });
//       } else if (isMultiSelect) {
//         form.setValue(optionSlug, optionValue.value?.split("; "));
//       } else if (isNotes) {
//         form.setValue(optionSlug, optionValue.value?.split("; "));
//       } else if (isCheckbox) {
//         form.setValue(optionSlug, optionValue.value === "1");
//       } else {
//         // For other field types, set the string value
//         form.setValue(optionSlug, optionValue.value);
//       }

//       //reset the is_updated_entry to false
//       setOriginalOptionsValues((prev) => {
//         const next = [...prev];
//         const found = next.find((ov) => ov.option_slug === optionSlug);
//         if (found) {
//           found.is_updated_entry = false;
//         }
//         return next;
//       });
//       // Mark form as dirty to enable submit button
//       setIsFormDirty(true);
//     }
//   };