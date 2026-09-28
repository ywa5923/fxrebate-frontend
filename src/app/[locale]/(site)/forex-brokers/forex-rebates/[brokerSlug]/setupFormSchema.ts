import { z } from "zod";
import type { Translations } from "@/providers/translations";
import { t } from "./translations";

export function createSetupSchema(translations?: Translations) {
  const message = (key: string) => translations ? t(translations, key) : undefined;
  return z.object({
    accountType: z.string().min(1, message("setup_validation_account_type")),
    platform: z.string().min(1, message("setup_validation_platform")),
    jurisdiction: z.string().min(1, message("setup_validation_jurisdiction")),
    accountName: z.string().trim().min(1, message("setup_validation_account_name")),
    accountNumber: z.string().trim().min(1, message("setup_validation_account_number")),
    authorized: z.boolean().refine(Boolean, message("setup_validation_authorized")),
  });
}

export const setupSchema = createSetupSchema();

export type SetupFormValues = z.infer<typeof setupSchema>;
