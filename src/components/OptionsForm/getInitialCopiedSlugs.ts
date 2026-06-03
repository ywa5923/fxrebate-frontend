import { Option, OptionValue } from "@/types";
export function getInitialCopiedSlugs(
    options: Option[],
    optionsValues: OptionValue[],
    is_admin: boolean,
  ): Set<string> {
  
    
    if (!is_admin) return new Set();
    const slugs = new Set<string>();
    for (const option of options) {
      const optionValue = optionsValues.find(
        (ov) => ov.option_slug === option.slug,
      );
      if (
        optionValue && optionValue.is_updated_entry === false &&
        (optionValue.public_value === null ||
          optionValue.public_value === "undefined") &&
        optionValue.value !== null &&
        optionValue.value !== "undefined"
      ) {
        slugs.add(option.slug);
      }
    }
    return slugs;
  }