export type RebateRate = {
  label: string;
  value: string;
};

export type BrokerRebate = {
  id: string;
  name: string;
  rating: number;
  reviewLabel: string;
  paymentMethod: string;
  rates: RebateRate[];
  logoSrc: string;
};

export const CATEGORY_TABS = [
  { id: "forex", label: "Forex Rebates", href: "/forex-brokers/forex-rebates" },
  {
    id: "crypto",
    label: "Cryptocurrency Rebates",
    href: "/forex-brokers/cryptocurrency-rebates",
  },
  {
    id: "prop",
    label: "Prop Firms Rebates",
    href: "/forex-brokers/prop-firm-rebates",
  },
] as const;

export const PAGE_COPY = {
  title: "Forex broker rebates",
  description:
    "When a trader links their new or existing forex trading account to us, the broker pays us a volume based commission for every trade that's placed. We then pay most of this back to our clients. Unlike a few of our competitors your spreads will never increase as a result of using our service. Instead, you'll pay lower transaction costs and increase your win ratio. Ultimately, you get a better deal working with us than working only with the broker.",
  disclaimer:
    "* Rebates are paid per closed position unless otherwise specified. 1 Lot = 100,000 base currency units traded.",
};

const defaultRates: RebateRate[] = [
  { label: "Nano", value: "1.5 USD/ lot" },
  { label: "Standard", value: "3.5 USD/ lot" },
  { label: "Max", value: "7 USD/ lot" },
  { label: "Tera", value: "1.5 USD/ lot" },
  { label: "Zero", value: "1 USD/ lot" },
];

/** Mock list matching Figma placeholders until API is wired. */
export const MOCK_BROKERS: BrokerRebate[] = Array.from({ length: 16 }, (_, i) => ({
  id: `axiory-${i + 1}`,
  name: "Axiory",
  rating: 5,
  reviewLabel: "5.0 Review",
  paymentMethod: "Monthly Rebates in FxRebate Wallet",
  rates: defaultRates,
  logoSrc: "/forex-rebates/axiory-logo.png",
}));
