import translationsJson from "./translations.json";

/** Order matches CATEGORY_TABS index — do not key off translated labels. */
export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;
export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];

/** Backend locale_resources key for this page (section: client). */
export const FOREX_REBATES_TRANSLATION_KEY = "forex_rebates_page";

/** EN defaults — used in page.tsx only when translations API fails. */
export const FOREX_REBATES_DEFAULTS = translationsJson;

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
