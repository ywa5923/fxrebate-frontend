import type { Translations } from "@/providers/translations";

export function t(translations: Translations, key: string): string {
  const value = translations[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing translation "${key}" for set_rebates_account_page`);
  }
  return value;
}

export function tSubmitError(
  translations: Translations,
  result: { message?: string; errorCode?: "invalid_request" | "service_unavailable" },
): string {
  if (result.errorCode === "invalid_request") {
    return t(translations, "setup_invalid_request");
  }
  if (result.errorCode === "service_unavailable") {
    return t(translations, "setup_service_unavailable");
  }
  return result.message || t(translations, "setup_submit_error");
}
