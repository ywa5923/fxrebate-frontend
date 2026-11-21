import { SITE_BROKER_TYPES } from "@/constants";

export const CATEGORY_TABS = [
  {
    brokerType: SITE_BROKER_TYPES[0],
    labelKey: "tab_forex_rebates",
    titleKey: "page_title_forex_rebates",
    descriptionKey: "page_description_forex_rebates",
  },
  {
    brokerType: SITE_BROKER_TYPES[1],
    labelKey: "tab_crypto_rebates",
    titleKey: "page_title_crypto_rebates",
    descriptionKey: "page_description_crypto_rebates",
  },
  {
    brokerType: SITE_BROKER_TYPES[2],
    labelKey: "tab_prop_rebates",
    titleKey: "page_title_propfirm_rebates",
    descriptionKey: "page_description_propfirm_rebates",
  },
] as const;

export function getCategoryTab(brokerType: string) {
  return CATEGORY_TABS.find((tab) => tab.brokerType === brokerType) ?? CATEGORY_TABS[0];
}
