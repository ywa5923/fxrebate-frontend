export const CATEGORY_TABS = [
  {
    brokerType: "broker",
    labelKey: "tab_forex_brokers",
    titleKey: "page_title_forex_brokers",
    descriptionKey: "page_description_forex_brokers",
  },
  {
    brokerType: "crypto",
    labelKey: "tab_crypto_exchanges",
    titleKey: "page_title_crypto_exchanges",
    descriptionKey: "page_description_crypto_exchanges",
  },
  {
    brokerType: "prop_firm",
    labelKey: "tab_prop_firms",
    titleKey: "page_title_prop_firms",
    descriptionKey: "page_description_prop_firms",
  },
] as const;

export function getCategoryTab(brokerType: string) {
  return CATEGORY_TABS.find((tab) => tab.brokerType === brokerType) ?? CATEGORY_TABS[0];
}
