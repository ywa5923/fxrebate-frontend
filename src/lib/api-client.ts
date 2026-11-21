"use server"
import { FTColumnsConfig, FTFilters, FTPagination } from "@/components/FilterableTable";
import logger from "./logger";
import { BASE_URL } from "@/constants";
import { getBearerToken } from "./auth-actions";
import { XFormDefinition } from "@/types";
import { ErrorMode, UseTokenAuth } from "./enums";


export interface ApiClientResponse<T, TFilters = FTFilters<T>> extends ServerJsonResponse<T, TFilters>{
  status?: number;
}

export interface ServerJsonResponse<T, TFilters = FTFilters<T>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: FTPagination;
  table_columns_config?: FTColumnsConfig<T>;
  filters_config?: TFilters;
  form_config?: XFormDefinition;
}

export async function apiClient<T, TFilters = FTFilters<T>>(
  url: string,
  useCookieToken: UseTokenAuth | boolean = UseTokenAuth.No,
  options: RequestInit = {},
  errorMode: ErrorMode = ErrorMode.Return
): Promise<ApiClientResponse<T, TFilters>> {
  
  const log = logger.child("lib/api-client/apiClient");
  const requestUrl = `${BASE_URL}${url}`;

  log.debug('ApiClient requestUrl',{requestUrl});

  let token = null;
  if (useCookieToken === UseTokenAuth.Yes || useCookieToken === true) {
    token = await getBearerToken();
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(requestUrl, { ...options, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    log.error("ApiClient Network exception", { url: requestUrl, message });

    if (errorMode === ErrorMode.Throw) throw new Error(message);
    return { success: false, message };
  }

  const status = response.status;
  const serverJsonResponse: ServerJsonResponse<T, TFilters> | null =
    await response.json().catch((error) => {
      log.error("Invalid JSON response", { url: requestUrl, status, error });
      return null;
    });

  if (!response.ok || serverJsonResponse?.success === false) {
    let message = serverJsonResponse?.message ?? `Request failed with status ${status}`;

    if (serverJsonResponse?.errors && typeof serverJsonResponse.errors === "object") {
      const validationErrors = Object.entries(serverJsonResponse.errors)
        .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : String(errs)}`)
        .join(" |** ");
      message += ` → ${validationErrors}`;
    }
    message += `***${serverJsonResponse?.error ?? ""}`;

    log.error("API request failed", {
      url: requestUrl,
      status,
      message,
      serverJsonResponse,
    });
    if (errorMode === ErrorMode.Throw) throw new Error(message);
    return { success: false, message, status };
  }

  const method = (options.method || "GET").toUpperCase();
  const baseResponse: ApiClientResponse<T, TFilters> = {
    success: true,
    data: serverJsonResponse?.data as T,
    status,
  };

  return method !== "GET"
    ? baseResponse
    : {
        ...baseResponse,
        pagination: serverJsonResponse?.pagination,
        table_columns_config: serverJsonResponse?.table_columns_config,
        filters_config: serverJsonResponse?.filters_config,
        form_config: serverJsonResponse?.form_config,
      };
}




