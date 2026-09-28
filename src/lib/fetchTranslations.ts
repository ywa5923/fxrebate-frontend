import "server-only";

import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";

const log = logger.child("lib/fetchTranslations");

const translationsSchema = z.record(z.string()).refine(
  (translations) => Object.values(translations).some((value) => value.trim().length > 0),
  "Translations must contain at least one non-empty text value",
);

type FetchTranslationsOptions = {
  key: string;
  locale: string;
  zone?: string | null;
  section?: string;
  revalidate?: number;
};

export async function fetchTranslations({
  key,
  locale,
  zone,
  section = "client",
  revalidate = 0,
}: FetchTranslationsOptions): Promise<Record<string, string>> {
  const query = new URLSearchParams({
    "key[eq]": key,
    "lang[eq]": locale,
    "section[eq]": section,
  });
  if (zone) query.set("zone[eq]", zone);

  const url = `/locale_resources?${query.toString()}`;
  const options: RequestInit = revalidate > 0
    ? {
        method: "GET",
        next: { revalidate, tags: ["translations", `translations:${key}`] },
      }
    : { method: "GET", cache: "no-store" };

  const response = await apiClient<Record<string, unknown>>(
    url,
    UseTokenAuth.No,
    options,
    ErrorMode.Return,
  );

  if (!response.success) {
    log.error("Error fetching translations", {
      url,
      message: response.message,
      status: response.status,
    });
    throw new Error(response.message || `Error fetching translations for ${key}`);
  }

  const parsed = translationsSchema.safeParse(response.data?.[section]);
  if (!parsed.success) {
    log.error("Invalid or empty translations", {
      url,
      key,
      locale,
      section,
      issues: parsed.error.issues,
    });
    throw new Error(`No valid ${section} translations found for ${key}`);
  }

  return parsed.data;
}
