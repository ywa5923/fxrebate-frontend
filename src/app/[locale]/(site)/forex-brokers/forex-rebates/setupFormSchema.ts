import { z } from "zod";

export const setupSchema = z.object({
  accountType: z.string().min(1, "Select an account type."),
  platform: z.string().min(1, "Select a trading platform."),
  jurisdiction: z.string().min(1, "Select a jurisdiction."),
  accountName: z.string().trim().min(1, "Enter the account name."),
  accountNumber: z.string().trim().min(1, "Enter the account number."),
  authorized: z.boolean().refine(Boolean, "Authorization is required."),
});

export type SetupFormValues = z.infer<typeof setupSchema>;
