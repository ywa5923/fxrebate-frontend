import "server-only";

import { headers } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { withTranslationContext } from "@/lib/translations";

const log = logger.child("lib/fetchTranslations");

type FetchTranslationsBaseOptions = {
  key: string;
  locale: string;
  zone?: string | null;
  page?: string;
};

type FetchTranslationsOptions = FetchTranslationsBaseOptions & {
  sections: readonly string[];
};

type TranslationSections = Record<string, Record<string, unknown>>;

export async function fetchTranslations({
  key,
  locale,
  zone,
  sections,
  page,
}: FetchTranslationsOptions): Promise<TranslationSections> {
  const requestPage = page ?? (await headers()).get("x-pathname") ?? `/${locale}`;
  const baseContext = {
    resource: key,
    locale,
    zone,
    page: requestPage,
  };

  const requestedSections = [...new Set(sections.map((value) => value.trim()).filter(Boolean))];
  const query = new URLSearchParams({ "key[eq]": key, "lang[eq]": locale });
  if (zone) query.set("zone[eq]", zone);
  if (requestedSections.length === 1) {
    query.set("section[eq]", requestedSections[0]);
  } else if (requestedSections.length > 1) {
    query.set("section[in]", requestedSections.join(","));
  }

  const url = `/locale_resources?${query.toString()}`;
  const diagnosticSection = requestedSections.length > 0 ? requestedSections.join(",") : "all";
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
      ...baseContext,
      section: diagnosticSection,
      url,
      message: response.message,
      status: response.status,
    });
    throw new Error(response.message || `Error fetching translations for ${key}`);
  }

  const responseSections = response.data;
  if (!isTranslationRecord(responseSections)) {
    return failForInvalidSection(key, requestedSections.join(",") || "all", baseContext);
  }

  const sectionNames = requestedSections.length > 0
    ? requestedSections
    : Object.entries(responseSections)
        .filter(([name, value]) => name !== "page_url" && isTranslationRecord(value))
        .map(([name]) => name);

  if (sectionNames.length === 0) {
    return failForInvalidSection(key, "all", baseContext);
  }

  const translations: TranslationSections = {};
  for (const sectionName of sectionNames) {
    const sectionTranslations = responseSections[sectionName];
    if (!isTranslationRecord(sectionTranslations) || !hasTranslationText(sectionTranslations)) {
      return failForInvalidSection(key, sectionName, baseContext);
    }
    translations[sectionName] = sectionTranslations;
  }

  return withTranslationContext(translations, baseContext);
}

function isTranslationRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasTranslationText(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (!isTranslationRecord(value)) return false;
  return Object.values(value).some(hasTranslationText);
}

function failForInvalidSection(
  key: string,
  section: string,
  context: { resource: string; locale: string; zone?: string | null; page: string },
): never {
  log.error("No usable translations were returned for this page", {
    event: "translations_unavailable",
    description: "The requested translation section is missing, malformed or contains no non-empty text values.",
    ...context,
    section,
  });
  throw new Error(`No valid translations found for ${key} (${section})`);
}
