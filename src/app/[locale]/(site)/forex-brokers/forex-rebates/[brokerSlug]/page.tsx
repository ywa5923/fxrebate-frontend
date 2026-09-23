import logger from "@/lib/logger";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { TranslationProvider } from "@/providers/translations";
import BrokerRebateDetail from "../BrokerRebateDetail";
import {
  FOREX_REBATES_TRANSLATION_KEY,
  SITE_BROKER_TYPES,
  type SiteBrokerType,
} from "../data";
import { fetchBrokerBySlug } from "../fetchBrokerBySlug";
import { getMockBrokerRebate } from "../mockBrokerRebate";
import { getSetupFormOptions } from "../setupFormData";

const log = logger.child(
  "site/forex-brokers/forex-rebates/[brokerSlug]/page.tsx",
);

function parseSiteBrokerType(
  value: string | undefined | null,
): SiteBrokerType {
  if (
    value &&
    (SITE_BROKER_TYPES as readonly string[]).includes(value)
  ) {
    return value as SiteBrokerType;
  }
  return SITE_BROKER_TYPES[0];
}

type LocaleResourcesPayload = {
  client?: Record<string, string>;
};

function parseBrokerId(value: string | undefined | null): number | null {
  if (!value) return null;
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

type Props = {
  params: Promise<{ locale: string; brokerSlug: string }>;
  searchParams?: Promise<{ broker_type?: string; broker_id?: string }>;
};

export default async function BrokerRebateDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, brokerSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const zone = await getZoneFromCookie();
  const brokerType = parseSiteBrokerType(resolvedSearchParams.broker_type);
  const brokerId = parseBrokerId(resolvedSearchParams.broker_id);

  const translationsQuery = new URLSearchParams({
    "key[eq]": FOREX_REBATES_TRANSLATION_KEY,
    "lang[eq]": locale,
    "section[eq]": "client",
  });
  if (zone) translationsQuery.set("zone[eq]", zone);

  const translationsUrl = "/locale_resources?" + translationsQuery.toString();

  const [broker, translationsResponse] = await Promise.all([
    fetchBrokerBySlug({
      locale,
      zone,
      brokerType,
      brokerSlug,
      brokerId,
    }),
    apiClient<LocaleResourcesPayload>(
      translationsUrl,
      UseTokenAuth.No,
      {
        method: "GET",
        next: {
          revalidate: 3600,
          tags: [
            "translations",
            "translations:" + FOREX_REBATES_TRANSLATION_KEY,
          ],
        },
      },
      ErrorMode.Return,
    ),
  ]);

  const resolvedBroker =
    broker ??
    getMockBrokerRebate({ brokerSlug, brokerId });

  if (!broker) {
    log.debug("Using mock broker rebate detail", {
      brokerSlug,
      brokerType,
      brokerId,
      tradingName: resolvedBroker.trading_name,
    });
  }

  if (!translationsResponse.success) {
    log.error("Error fetching forex rebates translations", {
      url: translationsUrl,
      message: translationsResponse.message,
      status: translationsResponse.status,
    });
    throw new Error(
      translationsResponse.message ||
        "Error fetching forex rebates translations",
    );
  }

  return (
    <TranslationProvider
      translations={translationsResponse.data?.client ?? {}}
    >
      <BrokerRebateDetail
        broker={resolvedBroker}
        locale={locale}
        brokerType={brokerType}
        formOptions={getSetupFormOptions(resolvedBroker)}
      />
    </TranslationProvider>
  );
}
