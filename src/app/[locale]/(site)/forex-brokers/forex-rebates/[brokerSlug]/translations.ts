import type { Translator } from "@/lib/createTranslator";

export function tSubmitError(
  t: Translator,
  result: { message?: string; errorCode?: "invalid_request" | "service_unavailable" },
): string {
  if (result.errorCode === "invalid_request") {
    return t("setup_invalid_request");
  }
  if (result.errorCode === "service_unavailable") {
    return t("setup_service_unavailable");
  }
  return result.message || t("setup_submit_error");
}
