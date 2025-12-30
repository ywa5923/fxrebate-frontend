import { SearchParams } from "@/types/SearchParams";

export function getQueryStringFromSearchParams<T>(params: SearchParams<T>): string {
 return new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();
   
}