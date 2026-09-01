/** Order matches CATEGORY_TABS index — do not key off translated labels. */
export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;
export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];

export const CATEGORY_TABS = [
  {
    brokerType: SITE_BROKER_TYPES[0],
    labelKey: "tab_forex_rebates" as const,
  },
  {
    brokerType: SITE_BROKER_TYPES[1],
    labelKey: "tab_crypto_rebates" as const,
  },
  {
    brokerType: SITE_BROKER_TYPES[2],
    labelKey: "tab_prop_rebates" as const,
  },
] as const;
