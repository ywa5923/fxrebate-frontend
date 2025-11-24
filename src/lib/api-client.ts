// apiClient.ts
import logger from "./logger";
import { BASE_URL } from "@/constants";

export interface ApiClientResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export async function apiClient<T>(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<ApiClientResponse<T>> {
  const log = logger.child("lib/api-client/apiClient");
  const requestUrl = `${BASE_URL}${url}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(requestUrl, { ...options, headers });
    const status = response.status;

    // Try parse JSON safely
    const data = await response.json().catch((err) => {
      log.error("Invalid JSON response", { url: requestUrl, status, error: err });
      return null;
    });

    if (!response.ok) {
      let message = data?.message ?? `Request failed with status ${status}`;

      if (data?.errors && typeof data.errors === "object") {
        const validationErrors = Object.entries(data.errors)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : String(errs)}`)
          .join(" | ");
        message += ` → ${validationErrors}`;
      }

      log.error("API request failed", { url: requestUrl, status, message, data });
      return { success: false, message, status };
    }

    return { success: true, data: data as T, status };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    log.error("Network exception", { url: requestUrl, message });
    return { success: false, message };
  }
}


export function searchParamsToString(searchParams: Record<string, string | string[] | undefined>): string {
  return new URLSearchParams(
    Object.entries(searchParams).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "string") acc[key] = value;
      else if (Array.isArray(value)) acc[key] = value.join(",");
      return acc;
    }, {})
  ).toString();
}
