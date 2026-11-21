import { BASE_URL } from "@/constants";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import logger from "@/lib/logger";
import { normalizeRatingFilterParams } from "@/lib/rating-filter-params";
import ClientdataTable from "@/components/ClientDataTable";
import type {
  BrokerTableColumnsConfig,
  BrokerTableDefaultColumn,
  BrokerTableRow,
} from "@/components/ClientDataTable";
import type { FilterConfig } from "@/components/FilterPanel";

type SearchParams = Record<string, string | string[] | undefined>;

type CompareTableDataProps = {
  locale: string;
  brokerType: string;
  activeTabLabel: string;
  searchParams: SearchParams;
};

type ReviewsApiResponse = {
  success: boolean;
  data?: BrokerTableRow[];
  table_columns_config?: BrokerTableColumnsConfig | null;
  table_default_columns?: BrokerTableDefaultColumn[];
  filters_config?: FilterConfig | null;
  message?: string;
  error?: string;
};

const TABLE_LABELS = {
  en: { chooseColumns: "Choose columns" },
  fr: { chooseColumns: "Choisir les colonnes" },
} as const;

export default async function CompareTableData({
  locale,
  brokerType,
  activeTabLabel,
  searchParams,
}: CompareTableDataProps) {
  const zone = await getZoneFromCookie();
  const query = new URLSearchParams({
    broker_type: brokerType,
    language_code: locale,
  });

  if (zone) query.set("zone_code", zone);

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
  const url = `${BASE_URL}/site/brokers?${query.toString()}`;
  const log = logger.child("site/forex-brokers/compare/CompareTableData.tsx");
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

  const tableColumnsConfig = payload.table_columns_config ?? {
    columns: [],
    btn_labels: {
      columns: "Columns",
      reset_columns: "Reset Columns",
    },
  };
  const tableLabels = TABLE_LABELS[locale as keyof typeof TABLE_LABELS] ?? TABLE_LABELS.en;

  return (
    <ClientdataTable
      brokers={payload.data ?? []}
      tableColumnsConfig={tableColumnsConfig}
      defaultColumns={payload.table_default_columns ?? []}
      filtersConfig={payload.filters_config ?? null}
      activeTabLabel={activeTabLabel}
      labels={tableLabels}
    />
  );
}
