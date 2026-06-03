import { Option, OptionValue } from "@/types";

export function buildDefaultValues(
    options: Option[],
    optionsValues: OptionValue[],
    is_admin: boolean,
  ) {
    return options.reduce((acc, option) => {
      const optionValue = optionsValues?.find(
        (optionValue) => optionValue.option_slug === option.slug,
      );
  
      if(!optionValue && option.form_type === "checkbox") {
        return { ...acc, [option.slug]: false };
      }
  
      if (!optionValue) {
        return { ...acc, [option.slug]: null };
      }
  
      const fieldValue = is_admin
        ? optionValue.public_value === null ||
          optionValue.public_value === "undefined"
          ? optionValue.value
          : optionValue.public_value
        : optionValue.value;
  
      const metadata = is_admin
        ? optionValue.metadata?.public_value ?? optionValue.metadata?.value
        : optionValue.metadata?.value;
  
      switch (option.form_type) {
        case "checkbox":
          return { ...acc, [option.slug]: fieldValue === "1" };
  
        case "multiple_select":
          return { ...acc, [option.slug]: fieldValue ? fieldValue.split("; ") : [] };
  
        case "notes":
          return { ...acc, [option.slug]: fieldValue ? fieldValue.split("; ") : [""] };
  
        case "numberWithUnit":
          return {
            ...acc,
            [option.slug]: {
              value: fieldValue ? parseFloat(fieldValue) : null,
              unit: metadata?.unit ?? null,
            },
          };
  
        case "image":
          return { ...acc, [option.slug]: fieldValue };
  
        default:
          return { ...acc, [option.slug]: fieldValue };
      }
    }, {});
  }
  
  