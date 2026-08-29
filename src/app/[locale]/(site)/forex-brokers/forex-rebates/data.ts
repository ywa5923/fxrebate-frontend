/** Order matches CATEGORY_TABS index — do not key off translated labels. */
export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;
export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];

export const CATEGORY_TABS = [
  {
    brokerType: SITE_BROKER_TYPES[0],
    label: "Forex Rebates",
  },
  {
    brokerType: SITE_BROKER_TYPES[1],
    label: "Cryptocurrency Rebates",
  },
  {
    brokerType: SITE_BROKER_TYPES[2],
    label: "Prop Firms Rebates",
  },
] as const;

export function parseSiteBrokerType(
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

export const PAGE_COPY = {
  title: "Forex broker rebates",
  description:
    "When a trader links their new or existing forex trading account to us, the broker pays us a volume based commission for every trade that's placed. We then pay most of this back to our clients. Unlike a few of our competitors your spreads will never increase as a result of using our service. Instead, you'll pay lower transaction costs and increase your win ratio. Ultimately, you get a better deal working with us than working only with the broker.",
  disclaimer:
    "* Rebates are paid per closed position unless otherwise specified. 1 Lot = 100,000 base currency units traded.",
};
