"use server";

import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { setupSchema, type SetupFormValues } from "./setupFormSchema";

// Replace this path when the rebate request endpoint is available.
const REBATE_REQUEST_ENDPOINT = "/site/forex-rebate-requests";

export async function submitBrokerRebate(
  brokerId: number,
  values: SetupFormValues,
): Promise<{ success: boolean; message?: string }> {
  const parsed = setupSchema.safeParse(values);
  if (!Number.isSafeInteger(brokerId) || brokerId <= 0 || !parsed.success) {
    return { success: false, message: "Invalid rebate request." };
  }

  const response = await apiClient<unknown>(
    REBATE_REQUEST_ENDPOINT,
    UseTokenAuth.Yes,
    {
      method: "POST",
      body: JSON.stringify({
        broker_id: brokerId,
        request_type: "new_account",
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
    message: response.status === 404
      ? "Rebate request service is not available yet."
      : response.message,
  };
}
