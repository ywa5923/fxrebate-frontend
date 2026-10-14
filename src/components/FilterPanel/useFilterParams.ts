"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const NAVIGATION_DELAY_MS = 300;

export function valuesFromParams(
  params: Pick<URLSearchParams, "getAll">,
  queryParam: string,
): string[] {
  return params.getAll(queryParam).flatMap((value) =>
    value.split(",").map((item) => item.trim()).filter(Boolean),
  );
}

function setValues(params: URLSearchParams, queryParam: string, values: string[]) {
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length > 0) {
    params.set(queryParam, uniqueValues.join(","));
  } else {
    params.delete(queryParam);
  }
}

export function useFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function cancelNavigation() {
      if (navigationTimer.current !== null) clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }

    window.addEventListener("popstate", cancelNavigation);
    return () => {
      window.removeEventListener("popstate", cancelNavigation);
      cancelNavigation();
    };
  }, []);

  function updateParams(update: (params: URLSearchParams) => void) {
    // Read the live URL so rapid clicks never build on an older render's selection.
    const url = new URL(window.location.href);
    update(url.searchParams);
    url.searchParams.delete("page");
    const query = url.searchParams.toString().replace(/%2C/gi, ",");
    const href = url.pathname + (query ? `?${query}` : "") + url.hash;
    if (href === window.location.pathname + window.location.search + window.location.hash) return;

    // Next.js synchronizes useSearchParams through history without waiting for the server.
    window.history.replaceState(null, "", href);
    if (navigationTimer.current !== null) clearTimeout(navigationTimer.current);
    const updatedHref = window.location.href;
    navigationTimer.current = setTimeout(() => {
      navigationTimer.current = null;
      // Navigation lets newer selections supersede in-flight requests; a full refresh can reload stale URLs.
      if (window.location.href === updatedHref) router.replace(href, { scroll: false });
    }, NAVIGATION_DELAY_MS);
  }

  function updateValue(queryParam: string, values: string[]) {
    updateParams((params) => setValues(params, queryParam, values));
  }

  function toggleValue(queryParam: string, value: string, checked: boolean) {
    updateParams((params) => {
      const values = valuesFromParams(params, queryParam);
      setValues(params, queryParam, checked
        ? [...values, value]
        : values.filter((item) => item !== value));
    });
  }

  function clearValues(queryParams: string[]) {
    updateParams((params) => {
      for (const queryParam of queryParams) params.delete(queryParam);
    });
  }

  return { searchParams, updateValue, toggleValue, clearValues };
}
