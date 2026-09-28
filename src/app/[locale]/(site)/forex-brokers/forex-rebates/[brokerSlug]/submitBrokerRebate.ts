"use server";

import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { setupSchema, type SetupFormValues } from "./setupFormSchema";

type RebateRequestType = "new_account" | "transfer";
type RebateErrorCode = "invalid_request" | "service_unavailable";

// Replace this path when the rebate request endpoint is available.
const REBATE_REQUEST_ENDPOINT = "/site/forex-rebate-requests";

export async function submitBrokerRebate(
  brokerId: number,
  values: SetupFormValues,
  requestType: RebateRequestType = "new_account",
): Promise<{ success: boolean; message?: string; errorCode?: RebateErrorCode }> {
  const parsed = setupSchema.safeParse(values);
  if (
    !Number.isSafeInteger(brokerId) ||
    brokerId <= 0 ||
    !parsed.success ||
    (requestType !== "new_account" && requestType !== "transfer")
  ) {
    return { success: false, errorCode: "invalid_request" };
  }

  const response = await apiClient<unknown>(
    REBATE_REQUEST_ENDPOINT,
    UseTokenAuth.Yes,
    {
      method: "POST",
      body: JSON.stringify({
        broker_id: brokerId,
        request_type: requestType,
        account_type: parsed.data.accountType,
        trading_platform: parsed.data.platform,
        jurisdiction: parsed.data.jurisdiction,
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
