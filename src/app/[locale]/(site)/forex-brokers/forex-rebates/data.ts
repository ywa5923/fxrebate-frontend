import type { HighestRebateBroker } from "@/types";

export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;
export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];
export type RebateSetupType = "new" | "transfer" | "partner";

export function brokerRebateSlug(tradingName: string): string {
  return tradingName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function brokerRebateDetailHref(
  locale: string,
  broker: HighestRebateBroker,
  brokerType: SiteBrokerType,
  setupType: RebateSetupType = "new",
): string {
  const qs = new URLSearchParams({
    broker_type: brokerType,
    broker_id: String(broker.broker_id),
    type: setupType,
  });
  return "/" + locale + "/forex-brokers/forex-rebates/" +
    brokerRebateSlug(broker.trading_name) + "?" + qs;
}
