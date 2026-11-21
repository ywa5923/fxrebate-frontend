import { SITE_BROKER_TYPES } from "@/constants";

export type SiteBrokerType = (typeof SITE_BROKER_TYPES)[number];

export function getSiteBrokerType(value: unknown): SiteBrokerType {
  if (typeof value !== "string") return SITE_BROKER_TYPES[0];
  return (
    SITE_BROKER_TYPES.find((brokerType) => brokerType === value) ??
    SITE_BROKER_TYPES[0]
  );
}
