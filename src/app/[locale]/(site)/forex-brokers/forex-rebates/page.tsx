import logger from "@/lib/logger";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { TranslationProvider } from "@/providers/translations";
import type { HighestRebateBroker } from "@/types";
import ForexRebatesClient from "./ForexRebatesClient";

import {
  FOREX_REBATES_DEFAULTS,
  FOREX_REBATES_TRANSLATION_KEY,
  parseSiteBrokerType,
} from "./data";

type LocaleResourcesPayload = {
  client?: Record<string, string>;
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    page?: string;
    per_page?: string;
    trading_name?: string;
    order_by?: string;
    order_direction?: string;
    broker_type?: string;
  }>;
};

export default async function ForexRebatesPage({ params, searchParams }: Props) {
  const log = logger.child(
    "site/forex-brokers/forex-rebates/page.tsx",
  );
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const zone = (await getZoneFromCookie()) ?? "eu";

  const page = resolvedSearchParams.page ?? "1";
  const perPage = resolvedSearchParams.per_page ?? "15";
  const tradingName = resolvedSearchParams.trading_name?.trim();
  const brokerType = parseSiteBrokerType(resolvedSearchParams.broker_type);
  const orderDirection =
    resolvedSearchParams.order_direction === "asc" ||
    resolvedSearchParams.order_direction === "desc"
      ? resolvedSearchParams.order_direction
      : null;

  const query = new URLSearchParams({
    language_code: locale,
    page,
    per_page: perPage,
    broker_type: brokerType,
  });
  if (orderDirection) {
    query.set("order_by", "trading_name");
    query.set("order_direction", orderDirection);
  }
  if (tradingName) {
    query.set("trading_name", tradingName);
  }

  const url = `/site/highest-rebates?${query.toString()}`;
  const translationsUrl =
    `/locale_resources?key[eq]=${FOREX_REBATES_TRANSLATION_KEY}` +
    `&lang[eq]=${locale}&zone[eq]=${zone}&section[eq]=client`;

  log.debug("Fetching highest rebates", { url });

  const [response, translationsResponse] = await Promise.all([
    apiClient<HighestRebateBroker[]>(
      url,
      UseTokenAuth.No,
      {
        method: "GET",
        next: {
          revalidate: 60,
          tags: ["highest-rebates", `highest-rebates:${brokerType}`],
        },
      },
      ErrorMode.Return,
    ),
    apiClient<LocaleResourcesPayload>(
      translationsUrl,
      UseTokenAuth.No,
      {
        method: "GET",
        next: {
          revalidate: 3600,
          tags: [
            "translations",
            `translations:${FOREX_REBATES_TRANSLATION_KEY}`,
          ],
        },
      },
      ErrorMode.Return,
    ),
  ]);

  if (!response.success || !response.data) {
    log.error("Error fetching highest rebates", {
      url,
      message: response.message,
      status: response.status,
    });
    throw new Error(response.message || "Error fetching highest rebates");
  }

  if (!translationsResponse.success) {
    log.error("Error fetching forex rebates translations", {
      url: translationsUrl,
      message: translationsResponse.message,
      status: translationsResponse.status,
    });
  }

  const pageTranslations = translationsResponse.success
    ? (translationsResponse.data?.client ?? {})
    : FOREX_REBATES_DEFAULTS;


  return (
    <TranslationProvider translations={pageTranslations}>
      <ForexRebatesClient
        brokers={response.data}
        orderDirection={orderDirection}
        tradingName={tradingName}
        perPage={perPage}
        activeBrokerType={brokerType}
        totalPages={response.pagination?.last_page ?? 1}
      />
    </TranslationProvider>
  );
}
