import type { HighestRebateBroker, HighestRebateEntry } from "@/types";
import { brokerRebateSlug } from "./data";

const MOCK_REBATES: HighestRebateEntry[] = [
  {
    id: 1,
    account_type_id: 101,
    account_type_name: "Standard",
    public_value: "$4.50 / lot",
    use_for_promo: true,
    zone_id: null,
  },
  {
    id: 2,
    account_type_id: 102,
    account_type_name: "Raw Spread",
    public_value: "$2.00 / lot",
    use_for_promo: true,
    zone_id: null,
  },
  {
    id: 3,
    account_type_id: 103,
    account_type_name: "Pro",
    public_value: "$3.25 / lot",
    use_for_promo: false,
    zone_id: null,
  },
  {
    id: 4,
    account_type_id: 104,
    account_type_name: "Islamic",
    public_value: "$4.00 / lot",
    use_for_promo: false,
    zone_id: null,
  },
];

const MOCK_BROKERS: HighestRebateBroker[] = [
  {
    broker_id: 12,
    trading_name: "IC Markets",
    logo: null,
    payment_options: "Bank transfer, Visa, Skrill, Neteller",
    rebates: MOCK_REBATES,
  },
  {
    broker_id: 4,
    trading_name: "Juno Markets",
    logo: null,
    payment_options: "Bank transfer, Crypto wallet",
    rebates: MOCK_REBATES.slice(0, 3),
  },
];

function slugToTradingName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Temporary mock data until the broker detail API is wired up. */
export function getMockBrokerRebate({
  brokerSlug,
  brokerId,
}: {
  brokerSlug: string;
  brokerId: number | null;
}): HighestRebateBroker {
  const byId = brokerId
    ? MOCK_BROKERS.find((broker) => broker.broker_id === brokerId)
    : undefined;
  if (byId) {
    return byId;
  }

  const bySlug = MOCK_BROKERS.find(
    (broker) => brokerRebateSlug(broker.trading_name) === brokerSlug,
  );
  if (bySlug) {
    return bySlug;
  }

  return {
    broker_id: brokerId ?? 0,
    trading_name: slugToTradingName(brokerSlug),
    logo: null,
    payment_options: "Bank transfer, Card, E-wallet",
    rebates: MOCK_REBATES,
  };
}
