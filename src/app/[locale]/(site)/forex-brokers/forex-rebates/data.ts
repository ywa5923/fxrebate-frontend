import type { HighestRebateBroker } from "@/types";

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
  broker: Pick<HighestRebateBroker, "broker_id" | "trading_name">,
  brokerType: string,
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
