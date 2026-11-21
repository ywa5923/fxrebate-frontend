import { BASE_URL, SITE_BROKER_TYPES } from "@/constants";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import logger from "@/lib/logger";
import ClientDataTable, {
  type BrokerTableColumnsConfig,
  type BrokerTableDefaultColumn,
  type BrokerTableRow,
} from "@/components/ClientDataTable";
import type { FilterConfig } from "@/components/FilterPanel";
import { normalizeRatingFilterParams } from "@/lib/rating-filter-params";

const TRANSLATION_KEY = "forex_brokers_compare";

type ReviewsApiResponse = {
  success: boolean;
  data?: BrokerTableRow[];
  table_columns_config?: BrokerTableColumnsConfig | null;
  table_default_columns?: BrokerTableDefaultColumn[];
  filters_config?: FilterConfig | null;
  message?: string;
  error?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
};

function getBrokerType(value: string | undefined): string {
  return (SITE_BROKER_TYPES as readonly string[]).includes(value ?? "")
    ? value!
    : SITE_BROKER_TYPES[0];
}

export default async function ReviewsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const brokerType = getBrokerType(
    typeof resolvedSearchParams.broker_type === "string"
      ? resolvedSearchParams.broker_type
      : undefined,
  );
  const zone = await getZoneFromCookie();
  const query = new URLSearchParams({
    broker_type: brokerType,
    language_code: locale,
  });

  if (zone) query.set("zone_code", zone);

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (!key.startsWith("filter_")) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const filterValue of values) {
      if (typeof filterValue === "string" && filterValue.trim()) {
        query.append(key, filterValue);
      }
    }
  }

  normalizeRatingFilterParams(query);
  const url = `${BASE_URL}/site/brokers?${query.toString()}`;
  const log = logger.child("site/forex-brokers/reviews/page.tsx");
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: 60,
      tags: ["site-brokers", `site-brokers:${brokerType}`],
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | ReviewsApiResponse
    | null;

  if (!response.ok || !payload?.success) {
    const message =
      payload?.message ?? payload?.error ?? `Request failed with status ${response.status}`;
    log.error("Unable to fetch broker reviews table", {
      url,
      status: response.status,
      message,
    });
    throw new Error(message);
  }

  return (
    <ClientDataTable
      locale={locale}
      brokerType={brokerType}
      brokers={payload.data ?? []}
      tableColumnsConfig={payload.table_columns_config ?? null}
      defaultColumns={payload.table_default_columns ?? []}
      filtersConfig={payload.filters_config ?? null}
    />
  );
}
