// apiClient.ts
import logger from "./logger";
import { BASE_URL } from "@/constants";

export interface ApiClientResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export interface ServerJsonResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
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
    const response: Response = await fetch(requestUrl, { ...options, headers });
    const status = response.status;

    // Try parse JSON safely
    const serverJsonResponse: ServerJsonResponse<T> = await response.json().catch((err) => {
      log.error("Invalid JSON response", { url: requestUrl, status, error: err });
      return null;
    });

    if (!response.ok) {
     
      let message = serverJsonResponse?.message ?? `Request failed with status ${status}`;

      if (serverJsonResponse?.errors && typeof serverJsonResponse.errors === "object") {
        const validationErrors = Object.entries(serverJsonResponse.errors)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : String(errs)}`)
          .join(" | ");
        message += ` → ${validationErrors}`;
      }

      log.error("API request failed", { url: requestUrl, status, message, serverJsonResponse });
      return { success: false, message, status };
    }

    return { success: true, data: serverJsonResponse.data as T, status };

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
