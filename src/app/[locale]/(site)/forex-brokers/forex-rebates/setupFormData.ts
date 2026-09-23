import type { HighestRebateBroker } from "@/types";

const PLATFORM_OPTIONS = [
  "MT4 for Windows",
  "MT4 for MAC",
  "MT4 WebTrader",
  "MT4 Mobile",
  "MT5 for Windows",
  "MT5 for MAC",
  "MT5 WebTrader",
  "MT5 Mobile",
  "cTrader for Windows",
  "cTrader Web Platform",
  "cTrader Mobile",
] as const;

const JURISDICTION_OPTIONS = [
  "Cyprus",
  "United Kingdom",
  "Bahamas",
  "Seychelles",
  "Mauritius",
  "Saint Lucia",
  "Costa Rica",
] as const;

export type SetupFormOptions = {
  accountTypes: string[];
  platforms: string[];
  jurisdictions: string[];
};

export function getSetupFormOptions(broker: HighestRebateBroker): SetupFormOptions {
  const accountTypes = [...new Set(
    broker.rebates
      .map((rebate) => rebate.account_type_name?.trim())
      .filter((name): name is string => Boolean(name)),
  )];

  return {
    accountTypes: accountTypes.length > 0
      ? accountTypes
      : ["Standard", "Raw Spread", "Pro", "Islamic"],
    platforms: [...PLATFORM_OPTIONS],
    jurisdictions: [...JURISDICTION_OPTIONS],
  };
}
