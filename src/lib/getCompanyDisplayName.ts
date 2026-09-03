import { Company } from "@/types";

export function getCompanyDisplayName(
  company: Pick<Company, "option_values">,
): string {
  return (
    company.option_values
      ?.find((option) => option.option_slug === "company_name")
      ?.value?.trim() ?? ""
  );
}
