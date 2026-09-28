import { Company } from "@/types";

export function getCompanyDisplayName(
  company: Pick<Company, "option_values">,
  is_admin = false,
): string {
  const nameOption = company.option_values?.find(
    (option) => option.option_slug === "company_name",
  );
  const name = is_admin
    ? nameOption?.public_value ?? nameOption?.value
    : nameOption?.value;

  return name?.trim() ?? "";
}
