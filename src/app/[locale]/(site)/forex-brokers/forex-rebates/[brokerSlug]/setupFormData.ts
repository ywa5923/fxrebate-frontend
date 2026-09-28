import { z } from "zod";

const selectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const registrationLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }),
});

const notesSchema = z.union([z.string(), z.array(z.string()), z.null()])
  .transform((value) => {
    const notes = Array.isArray(value) ? value : value ? [value] : [];
    return notes.flatMap((note) => note.split("#-#"))
      .map((note) => note.trim())
      .filter(Boolean);
  });

export const setupFormDataSchema = z.object({
  logo: z.string().url().nullable(),
  trading_name: z.string().trim().min(1),
  account_types: z.array(z.object({
    account_type_id: z.number().int().positive(),
    account_type_name: z.string().min(1),
    platform_urls: z.array(selectOptionSchema.extend({ id: z.number().int() })),
    jurisdictions: z.array(selectOptionSchema.extend({
      company_ids: z.array(z.number().int()),
      option_value_ids: z.array(z.number().int()),
    })),
  })),
  ib_links: z.array(registrationLinkSchema),
  sub_ib_links: z.array(registrationLinkSchema),
  general_account_setup_notes: notesSchema,
  transfer_account_notes: notesSchema,
  sub_ib_notes: notesSchema,
});

export type SetupFormData = z.infer<typeof setupFormDataSchema>;
export type SetupAccountType = SetupFormData["account_types"][number];
export type SetupRegistrationLink = SetupFormData["ib_links"][number];
