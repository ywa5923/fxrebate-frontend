import logger from "@/lib/logger";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { TranslationProvider } from "@/providers/translations";
import BrokerRebateDetail from "./BrokerRebateDetail";
import {
  SITE_BROKER_TYPES,
  type RebateSetupType,
  type SiteBrokerType,
} from "../data";
import { fetchBrokerBySlug } from "./fetchBrokerBySlug";
import { getSetupFormOptions } from "./setupFormData";

const SET_REBATES_ACCOUNT_TRANSLATION_KEY = "set_rebates_account_page";

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
  searchParams?: Promise<{ broker_type?: string; broker_id?: string; type?: string }>;
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
  const setupType: RebateSetupType =
    resolvedSearchParams.type === "transfer" ||
    resolvedSearchParams.type === "partner"
      ? resolvedSearchParams.type
      : "new";

  const translationsQuery = new URLSearchParams({
    "key[eq]": SET_REBATES_ACCOUNT_TRANSLATION_KEY,
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
        cache: "no-store",
      },
      ErrorMode.Return,
    ),
  ]);

  if (!broker) {
    notFound();
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

  const clientTranslations = translationsResponse.data?.client;
  if (
    !clientTranslations ||
    Array.isArray(clientTranslations) ||
    !Object.values(clientTranslations).some(
      (value) => typeof value === "string" && value.trim().length > 0,
    )
  ) {
    log.error("No broker rebate account translations returned", {
      url: translationsUrl,
      key: SET_REBATES_ACCOUNT_TRANSLATION_KEY,
      locale,
    });
    throw new Error(
      `No client translations found for ${SET_REBATES_ACCOUNT_TRANSLATION_KEY}`,
    );
  }

  return (
    <TranslationProvider translations={clientTranslations}>
      <BrokerRebateDetail
        broker={broker}
        locale={locale}
        brokerType={brokerType}
        setupType={setupType}
        formOptions={getSetupFormOptions(broker)}
      />
    </TranslationProvider>
  );
}
