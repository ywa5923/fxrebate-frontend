import "server-only";

import { headers } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { prepareTranslations } from "@/lib/translations";

const log = logger.child("lib/fetchTranslations");

type FetchTranslationsOptions = {
  key: string;
  locale: string;
  zone?: string | null;
  section?: string;
};

export async function fetchTranslations({
  key,
  locale,
  zone,
  section = "client",
}: FetchTranslationsOptions): Promise<Record<string, string>> {
  const context = {
    resource: key,
    locale,
    zone,
    section,
    page: (await headers()).get("x-pathname") ?? `/${locale}`,
  };
  const query = new URLSearchParams({
    "key[eq]": key,
    "lang[eq]": locale,
    "section[eq]": section,
  });
  if (zone) query.set("zone[eq]", zone);

  const url = `/locale_resources?${query.toString()}`;
  const response = await apiClient<Record<string, unknown>>(
    url,
    UseTokenAuth.No,
    { method: "GET" },
    ErrorMode.Return,
  );

  if (!response.success) {
    log.error("Error fetching translations", {
      event: "translations_fetch_failed",
      description: "The backend could not provide translations required to render the page.",
      ...context,
      url,
      message: response.message,
      status: response.status,
    });
    throw new Error(response.message || `Error fetching translations for ${key}`);
  }

  return prepareTranslations(response.data?.[section], context);
}
