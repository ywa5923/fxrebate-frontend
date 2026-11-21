export type BrokerTableRow = Record<string, unknown>;

export type BrokerTableColumn = {
  key: string;
  label: string;
  type?: string;
  need_translation?: boolean;
  show_more_btn?: boolean;
  allow_order_by?: boolean;
};

export type BrokerTableColumnsConfig = {
  columns: BrokerTableColumn[];
  btn_labels: {
    columns: string;
    reset_columns: string;
    show?: string;
    items_per_page?: string;
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
};

export type BrokerTableDefaultColumn = {
  key: string;
  label?: string;
  allow_order_by?: boolean;
};

export const TABLE_PAGE_SIZE = 10;
export const TABLE_PAGE_SIZES = [10, 20, 50, 100, 200, 500] as const;
export const FALLBACK_DEFAULT_COLUMN_COUNT = 7;

export function getBooleanValue(value: unknown): boolean | null {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value !== "string") return null;

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "allowed":
      return true;
    case "0":
    case "false":
    case "no":
    case "not allowed":
      return false;
    default:
      return null;
  }
}

export function valueToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return valueToText(item.label ?? item.value ?? item.name ?? "");
  }
  return String(value);
}

export function filterBrokers(brokers: BrokerTableRow[], search: string): BrokerTableRow[] {
  const needle = search.trim().toLocaleLowerCase();
  if (!needle) return brokers;
  return brokers.filter((broker) =>
    Object.values(broker).some((value) => valueToText(value).toLocaleLowerCase().includes(needle)),
  );
}

export function getPagination(
  rawPage: string | null,
  rowCount: number,
  rawPageSize: string | null = null,
) {
  const requestedPageSize = rawPageSize !== null && /^\d+$/.test(rawPageSize)
    ? Number(rawPageSize)
    : TABLE_PAGE_SIZE;
  const pageSize = (TABLE_PAGE_SIZES as readonly number[]).includes(requestedPageSize)
    ? requestedPageSize
    : TABLE_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const requested = rawPage !== null && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Number.isSafeInteger(requested)
    ? Math.min(Math.max(1, requested), pageCount)
    : 1;
  return { page, pageCount, pageIndex: page - 1, pageSize };
}

export function getVisiblePageNumbers(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const neighbors = [1, pageCount, page - 1, page, page + 1];
  if (page <= 3) neighbors.push(2, 3, 4);
  if (page >= pageCount - 2) neighbors.push(pageCount - 3, pageCount - 2, pageCount - 1);
  const pages = [...new Set(neighbors)]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous && value - previous === 2) result.push(previous + 1);
    else if (previous && value - previous > 2) result.push("ellipsis");
    result.push(value);
  });
  return result;
}

export function setPageParam(params: URLSearchParams, page: number) {
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
}

export function setPageSizeParam(params: URLSearchParams, pageSize: number) {
  if (pageSize === TABLE_PAGE_SIZE) params.delete("per_page");
  else params.set("per_page", String(pageSize));
}

export function updateTableUrl(
  update: (params: URLSearchParams) => void,
  mode: "push" | "replace" = "push",
) {
  const url = new URL(window.location.href);
  update(url.searchParams);
  const query = url.searchParams.toString().replace(/%2C/gi, ",");
  const href = url.pathname + (query ? `?${query}` : "") + url.hash;
  if (href === window.location.pathname + window.location.search + window.location.hash) return;
  // Native history integrates with Next.js useSearchParams for this client-side table.
  if (mode === "replace") window.history.replaceState(null, "", href);
  else window.history.pushState(null, "", href);
}
