import { cacheLife } from "next/cache";
import { BASE_URL } from "@/constants";
import { OptionCategory } from "@/types";
import logger from "@/lib/logger";
import { getBearerToken } from "./auth-actions";

/**
 * Server-only helper: loads option categories + options for a broker.
 * Called from RSC pages; token is read outside the cache boundary.
 */
export async function getCategoriesWithOptions(
  locale: string | null = null,
  broker_type: string | null = null,
  broker_id: number,
): Promise<OptionCategory[]> {
  if (broker_id == null || Number.isNaN(broker_id)) {
    throw new Error("Broker ID is required");
  }

  // cookies()/auth must stay outside `"use cache"`
  const token = await getBearerToken();

  return getCachedCategoriesWithOptions(
    token,
    locale,
    broker_type,
    broker_id,
  );
}

async function getCachedCategoriesWithOptions(
  token: string | null,
  locale: string | null,
  broker_type: string | null,
  broker_id: number,
): Promise<OptionCategory[]> {
  //"use cache";
  // Built-in profile: revalidate ~1h (see Next.js cacheLife 'hours')
  //cacheLife("hours");

  const thisLogger = logger.child("lib/getGategoriesWithOptions");

  const url = new URL(`${BASE_URL}/option-categories/${broker_id}`);

  if (locale !== null && locale !== "en") {
    url.searchParams.append("language_code", locale);
  }
  if (broker_type) {
    url.searchParams.append("broker_type", broker_type);
  }

  thisLogger.debug("URL for fetching option categories", {
    url: url.toString(),
  });

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData.data as OptionCategory[];
  } catch (error) {
    console.error("Error fetching broker options:", error);
    throw error;
  }
}
