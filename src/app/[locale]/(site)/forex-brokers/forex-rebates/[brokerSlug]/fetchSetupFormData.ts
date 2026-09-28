import "server-only";

import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { setupFormDataSchema, type SetupFormData } from "./setupFormData";

const log = logger.child("site/forex-brokers/forex-rebates/fetchSetupFormData");

export async function fetchSetupFormData(
  brokerId: number,
  locale: string,
): Promise<SetupFormData> {
  const query = new URLSearchParams({ language_code: locale });
  const url = `/site/set-rebate-form/${brokerId}?${query.toString()}`;
  const response = await apiClient<unknown>(
    url,
    UseTokenAuth.No,
    { method: "GET", cache: "no-store" },
    ErrorMode.Return,
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.success) {
    log.error("Error fetching rebate form data", { url, status: response.status });
    throw new Error("Error fetching rebate form data");
  }

  const parsed = setupFormDataSchema.safeParse(response.data);
  if (!parsed.success) {
    log.error("Invalid rebate form data", { url, issues: parsed.error.issues });
    throw new Error("Invalid rebate form data");
  }

  return parsed.data;
}
