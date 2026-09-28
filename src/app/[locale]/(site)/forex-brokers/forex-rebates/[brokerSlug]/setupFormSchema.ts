import { z } from "zod";
import type { Translations } from "@/providers/translations";
import type { SetupAccountType } from "./setupFormData";
import { t } from "./translations";

export function createSetupSchema(accountTypes: SetupAccountType[], translations?: Translations) {
  const message = (key: string) => translations ? t(translations, key) : undefined;
  return z.object({
    accountType: z.string(),
    platform: z.string(),
    jurisdiction: z.string(),
    accountName: z.string().trim().min(1, message("setup_validation_account_name")),
    accountNumber: z.string().trim().min(1, message("setup_validation_account_number")),
    authorized: z.boolean(),
  }).superRefine((values, context) => {
    const accountType = accountTypes.find((account) => account.account_type_name === values.accountType);
    if (!accountType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountType"],
        message: message("setup_validation_account_type"),
      });
      return;
    }

    const dependentFields = [
      { name: "platform", options: accountType.platform_urls, key: "setup_validation_platform" },
      { name: "jurisdiction", options: accountType.jurisdictions, key: "setup_validation_jurisdiction" },
    ] as const;

    for (const field of dependentFields) {
      const value = values[field.name];
      const valid = field.options.length === 0
        ? value === ""
        : field.options.some((option) => option.value === value);
      if (!valid) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.name],
          message: message(field.key),
        });
      }
    }
  });
}

export type SetupFormValues = z.infer<ReturnType<typeof createSetupSchema>>;
