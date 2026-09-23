import type { HighestRebateBroker } from "@/types";

export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;
export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];

export const FOREX_REBATES_TRANSLATION_KEY = "forex_rebates_page";

export function brokerRebateSlug(tradingName: string): string {
  return tradingName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function brokerMatchesSlug(
  broker: HighestRebateBroker,
  slug: string,
): boolean {
  return brokerRebateSlug(broker.trading_name) === slug;
}

export function brokerRebateDetailHref(
  locale: string,
  broker: HighestRebateBroker,
  brokerType: SiteBrokerType,
): string {
  const qs = new URLSearchParams({
    broker_type: brokerType,
    broker_id: String(broker.broker_id),
  });
  return "/" + locale + "/forex-brokers/forex-rebates/" +
    brokerRebateSlug(broker.trading_name) + "?" + qs;
}

export function forexRebatesListHref(
  locale: string,
  brokerType: SiteBrokerType,
): string {
  const qs = new URLSearchParams({ broker_type: brokerType });
  return "/" + locale + "/forex-brokers/forex-rebates?" + qs;
}

export const CATEGORY_TABS = [
  {
    brokerType: SITE_BROKER_TYPES[0],
    labelKey: "tab_forex_rebates" as const,
    titleKey: "page_title_forex_rebates" as const,
    descriptionKey: "page_description_forex_rebates" as const,
  },
  {
    brokerType: SITE_BROKER_TYPES[1],
    labelKey: "tab_crypto_rebates" as const,
    titleKey: "page_title_crypto_rebates" as const,
    descriptionKey: "page_description_crypto_rebates" as const,
  },
  {
    brokerType: SITE_BROKER_TYPES[2],
    labelKey: "tab_prop_rebates" as const,
    titleKey: "page_title_propfirm_rebates" as const,
    descriptionKey: "page_description_propfirm_rebates" as const,
  },
] as const;
