"use server";

import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { z } from "zod";
import { createSetupSchema, type SetupFormValues } from "./setupFormSchema";
import { fetchSetupFormData } from "./fetchSetupFormData";

export type RebateRequestType = "new_account" | "transfer";
type RebateErrorCode = "invalid_request" | "service_unavailable";

const REBATE_REQUEST_ENDPOINT = "/site/save-rebate-form";

const requestSchema = z.object({
  brokerId: z.number().int().positive().safe(),
  brokerSlug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  locale: z.string().regex(/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i),
  requestType: z.enum(["new_account", "transfer"]),
  tabName: z.string().trim().min(1).max(200),
});

type RebateSubmission = z.infer<typeof requestSchema> & { values: SetupFormValues };

export async function submitBrokerRebate(
  submission: RebateSubmission,
): Promise<{ success: boolean; message?: string; errorCode?: RebateErrorCode }> {
  const request = requestSchema.safeParse(submission);
  if (!request.success) {
    return { success: false, errorCode: "invalid_request" };
  }
  const { brokerId, brokerSlug, locale, requestType, tabName } = request.data;

  let formData;
  try {
    formData = await fetchSetupFormData(brokerId, locale);
  } catch {
    return { success: false, errorCode: "service_unavailable" };
  }

  const parsed = createSetupSchema(formData.account_types).safeParse(submission.values);
  if (!parsed.success) {
    return { success: false, errorCode: "invalid_request" };
  }

  const response = await apiClient<unknown>(
    REBATE_REQUEST_ENDPOINT,
    UseTokenAuth.No,
    {
      method: "POST",
      body: JSON.stringify({
        broker_id: brokerId,
        broker_name: brokerSlug,
        request_type: requestType,
        tab_name: tabName,
        language_code: locale,
        account_type: parsed.data.accountType,
        trading_platform: parsed.data.platform || null,
        jurisdiction: parsed.data.jurisdiction || null,
        account_name: parsed.data.accountName,
        account_number: parsed.data.accountNumber,
        authorized: parsed.data.authorized,
      }),
    },
    ErrorMode.Return,
  );

  return {
    success: response.success,
    message: response.status === 404 ? undefined : response.message,
    errorCode: response.status === 404 ? "service_unavailable" : undefined,
  };
}
