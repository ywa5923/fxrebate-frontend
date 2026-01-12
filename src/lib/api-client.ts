"use server"
import { FTColumnsConfig, FTFilters, FTPagination } from "@/components/FilterableTable";
import logger from "./logger";
import { BASE_URL } from "@/constants";
import { getBearerToken } from "./auth-actions";
import { XFormDefinition } from "@/types";


export interface ApiClientResponse<T> extends ServerJsonResponse<T>{
  status?: number;
}

export interface ServerJsonResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: FTPagination;
  table_columns_config?: FTColumnsConfig<T>;
  filters_config?: FTFilters<T>;
  form_config?: XFormDefinition;
}

export async function apiClient<T>(
  url: string,
  useCookieToken: boolean = false,
  options: RequestInit = {}
): Promise<ApiClientResponse<T>> {
  
  const log = logger.child("lib/api-client/apiClient");
  const requestUrl = `${BASE_URL}${url}`;

  log.debug('##############requestUrl',{requestUrl});

  let token = null;
  if (useCookieToken) {
    token = await getBearerToken();
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response: Response = await fetch(requestUrl, { ...options, headers });
    const status = response.status;

    // Try parse JSON safely
    const serverJsonResponse: ServerJsonResponse<T>|null = await response.json().catch((err) => {
      log.error("Invalid JSON response", { url: requestUrl, status, error: err });
      return null;
    });

    
    if (!response.ok ) {
     
      let message = serverJsonResponse?.message ?? `Request failed with status ${status}`;
    

      if (serverJsonResponse?.errors && typeof serverJsonResponse.errors === "object") {
        const validationErrors = Object.entries(serverJsonResponse.errors)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : String(errs)}`)
          .join(" |** ");
        message += ` → ${validationErrors}`;
        
      }
      message +='***' + (serverJsonResponse?.error ?? '');

      log.error("API request failed", { url: requestUrl, status, message, serverJsonResponse });
      return { success: false, message, status };
    }

    const method = (options.method || 'GET').toUpperCase();
   

    const baseResponse: ApiClientResponse<T> = {
      success: true,
      data: (serverJsonResponse?.data as T),
      status,
    };

    return method!=='GET'
      ? baseResponse
      : {
          ...baseResponse,
          pagination: serverJsonResponse?.pagination,
          table_columns_config: serverJsonResponse?.table_columns_config,
          filters_config: serverJsonResponse?.filters_config,
          form_config: serverJsonResponse?.form_config,
        };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    log.error("Network exception", { url: requestUrl, message });
    return { success: false, message, status: 500 };
  }
}


// export  function searchParamsToString(searchParams: Record<string, string | string[] | undefined>): string {
//   return new URLSearchParams(
//     Object.entries(searchParams).reduce<Record<string, string>>((acc, [key, value]) => {
//       if (typeof value === "string") acc[key] = value;
//       else if (Array.isArray(value)) acc[key] = value.join(",");
//       return acc;
//     }, {})
//   ).toString();
// }


