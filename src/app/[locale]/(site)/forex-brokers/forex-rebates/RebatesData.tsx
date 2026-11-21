import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { normalizeRatingFilterParams } from "@/lib/rating-filter-params";
import type { FilterConfig } from "@/components/FilterPanel";
import type { HighestRebateBroker } from "@/types";
import ForexRebatesClient from "./ForexRebatesClient";

type SearchParams = Record<string, string | string[] | undefined>;

type RebatesDataProps = {
  locale: string;
  zone: string | null;
  brokerType: string;
  searchParams: SearchParams;
};

export default async function RebatesData({
  locale,
  zone,
  brokerType,
  searchParams,
}: RebatesDataProps) {
  const page = typeof searchParams.page === "string" ? searchParams.page : "1";
  const perPage = typeof searchParams.per_page === "string" ? searchParams.per_page : "15";
  const tradingName = typeof searchParams.trading_name === "string"
    ? searchParams.trading_name.trim()
    : undefined;
  const orderDirection = searchParams.order_direction === "asc" || searchParams.order_direction === "desc"
    ? searchParams.order_direction
    : null;

  const query = new URLSearchParams({
    language_code: locale,
    page,
    per_page: perPage,
    broker_type: brokerType,
  });
  if (zone) query.set("zone_code", zone);
  if (orderDirection) {
    query.set("order_by", "trading_name");
    query.set("order_direction", orderDirection);
  }
  if (tradingName) query.set("trading_name", tradingName);

  for (const [key, value] of Object.entries(searchParams)) {
    if (!key.startsWith("filter_")) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const filterValue of values) {
      if (typeof filterValue === "string" && filterValue.trim()) {
        query.append(key, filterValue);
      }
    }
  }

  normalizeRatingFilterParams(query);
  const url = `/site/highest-rebates?${query.toString()}`;
  const log = logger.child("site/forex-brokers/forex-rebates/RebatesData.tsx");
  log.debug("Fetching highest rebates", { url });

  const response = await apiClient<HighestRebateBroker[], FilterConfig>(
    url,
    UseTokenAuth.No,
    {
      method: "GET",
      next: {
        revalidate: 60,
        tags: ["highest-rebates", `highest-rebates:${brokerType}`],
      },
    },
    ErrorMode.Return,
  );

  if (!response.success || !response.data) {
    log.error("Error fetching highest rebates", {
      url,
      message: response.message,
      status: response.status,
    });
    throw new Error(response.message || "Error fetching highest rebates");
  }

  return (
    <ForexRebatesClient
      key={tradingName ?? ""}
      brokers={response.data}
      filtersConfig={response.filters_config}
      orderDirection={orderDirection}
      tradingName={tradingName}
      perPage={perPage}
      activeBrokerType={brokerType}
      totalPages={response.pagination?.last_page ?? 1}
    />
  );
}
