import { BASE_URL } from "@/constants";
import logger from "@/lib/logger";
import { withTranslationContext, type TranslationContextInfo } from "@/lib/translations";

const log = logger.child("lib/getTranslations");

export const getTranslations = async (locale: string, zone: string | null,key:string,section:string, context: TranslationContextInfo = {}) => {
    const url = new URL(`${BASE_URL}/locale_resources`);
  
    url.searchParams.append("key[eq]", key);
    url.searchParams.append("lang[eq]", locale);
    if (zone) url.searchParams.append("zone[eq]", zone);
    url.searchParams.append(section.includes(",") ? "section[in]" : "section[eq]", section);

    const diagnosticContext = { resource: key, locale, zone, ...context };
    try {
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch translations: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const value = data?.data;
      if (data?.success === false || !value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Translation response is missing or malformed.");
      }

      return withTranslationContext(value, diagnosticContext);
    } catch (error) {
      log.error("Error fetching translations", {
        event: "translations_fetch_failed",
        description: "The backend could not provide the requested translation resource.",
        ...diagnosticContext,
        section,
        url: url.toString(),
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
