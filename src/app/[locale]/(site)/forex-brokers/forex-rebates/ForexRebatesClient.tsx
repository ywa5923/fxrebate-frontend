"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, Search, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Pagination from "@/components/Pagination";
import {
  Translations,
  useTranslation,
} from "@/providers/translations";
import BrokerRebateCard from "./BrokerRebateCard";
import {
  CATEGORY_TABS,
  type SiteBrokerType,
} from "./data";
import type { HighestRebateBroker } from "@/types";

type ViewMode = "list" | "card";
type OrderDirection = "asc" | "desc";
type SortMode = OrderDirection | "default";

type Props = {
  brokers: HighestRebateBroker[];
  orderDirection: OrderDirection | null;
  tradingName?: string;
  perPage?: string;
  activeBrokerType: SiteBrokerType;
  totalPages: number;
};

export default function ForexRebatesClient({
  brokers,
  orderDirection,
  tradingName,
  perPage = "15",
  activeBrokerType,
  totalPages,
}: Props) {
  const params = useParams();
  const { push } = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "en";
  const _t = useTranslation() as Translations;
  const [view, setView] = useState<ViewMode>("list");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(tradingName ?? "");

  useEffect(() => {
    setSearchQuery(tradingName ?? "");
  }, [tradingName]);

  const sortOptions: { label: string; sort: SortMode }[] = [
    { label: _t["sort_default"] as string, sort: "default" },
    { label: _t["sort_name_asc"] as string, sort: "asc" },
    { label: _t["sort_name_desc"] as string, sort: "desc" },
  ];

  const activeSort: SortMode = orderDirection ?? "default";
  const activeSortLabel =
    sortOptions.find((option) => option.sort === activeSort)?.label ??
    _t["sort_default"] as string;

  function buildListParams(overrides: {
    brokerType?: SiteBrokerType;
    sort?: SortMode;
    tradingName?: string | null;
    page?: string;
  } = {}) {
    const nextParams = new URLSearchParams({
      broker_type: overrides.brokerType ?? activeBrokerType,
    });

    const sort = overrides.sort ?? activeSort;
    if (sort === "asc" || sort === "desc") {
      nextParams.set("order_by", "trading_name");
      nextParams.set("order_direction", sort);
    }

    if (overrides.page && overrides.page !== "1") {
      nextParams.set("page", overrides.page);
    }
    if (perPage !== "15") {
      nextParams.set("per_page", perPage);
    }

    const nextTradingName =
      overrides.tradingName === undefined
        ? tradingName
        : overrides.tradingName;
    if (nextTradingName) {
      nextParams.set("trading_name", nextTradingName);
    }

    return nextParams;
  }

  function buildListHref(
    overrides: Parameters<typeof buildListParams>[0] = {},
  ) {
    const qs = buildListParams(overrides).toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleSearchSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = searchQuery.trim();
    const nextParams = buildListParams({
      tradingName: trimmed || null,
      page: "1",
    });
    push(`${pathname}?${nextParams.toString()}`);
  }

  function handleSortChange(nextSort: SortMode) {
    setSortOpen(false);
    if (nextSort === activeSort) return;
    push(buildListHref({ sort: nextSort }));
  }

  function handleTabHref(brokerType: SiteBrokerType) {
    // Tab switch: only broker_type — leave sort/search to reset with defaults
    const nextParams = new URLSearchParams({ broker_type: brokerType });
    return `${pathname}?${nextParams.toString()}`;
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setView(mq.matches ? "card" : "list");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  async function handleShare() {
    const url = window.location.href;
    const title = _t["page_title"] as string;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled share
    }
  }

  return (
    <div className="bg-white text-[#0c110f] dark:bg-gray-950 dark:text-gray-100">
      {/* pt clears sticky floating site header */}
      <div className="mx-auto max-w-[1360px] px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pb-16 lg:pt-32">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Breadcrumb>
            <BreadcrumbList className="text-xs text-[#0c110f]/70 dark:text-gray-400 sm:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${locale}`}
                    className="hover:text-[#0c110f] dark:hover:text-gray-100"
                  >
                    {_t["breadcrumb_home"] as string}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${locale}/forex-brokers`}
                    className="hover:text-[#0c110f] dark:hover:text-gray-100"
                  >
                    {_t["breadcrumb_forex_brokers"] as string}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#0c110f] dark:text-gray-100">
                  {_t["breadcrumb_forex_rebates"] as string}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <button
            type="button"
            onClick={handleShare}
            className="hidden h-9 shrink-0 items-center gap-2 rounded-md border border-[#0c110f]/15 px-3 text-sm font-medium text-[#0c110f] hover:bg-black/5 dark:border-white/15 dark:text-gray-100 dark:hover:bg-white/5 md:inline-flex"
          >
            {_t["share"] as string}
            <Share2 className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            "mb-8 flex flex-col gap-2 rounded-lg bg-[#f0f0f0] p-1 dark:bg-[#202221]",
            "md:mb-6 md:inline-flex md:h-9 md:max-w-full md:flex-row md:items-center md:gap-0 md:overflow-x-auto",
          )}
          role="tablist"
          aria-label={_t["rebate_categories_aria"] as string}
        >
          {CATEGORY_TABS.map((tab) => {
            const active = tab.brokerType === activeBrokerType;
            return (
              <Link
                key={tab.brokerType}
                href={handleTabHref(tab.brokerType)}
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors md:h-7 md:min-w-[160px] md:px-5",
                  active
                    ? "bg-[#0c110f] text-white shadow-sm dark:bg-white dark:text-[#0c110f]"
                    : "bg-transparent text-[#0c110f]/70 hover:text-[#0c110f] dark:text-white/80 dark:hover:text-white",
                )}
              >
                {_t[tab.labelKey] as string}
              </Link>
            );
          })}
        </div>

        <header className="mb-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
            {_t["page_title"] as string}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#0c110f]/80 dark:text-gray-300 sm:text-base">
            {_t["page_description"] as string}
          </p>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={handleSearchSubmit}
          >
            <label className="relative flex h-11 w-full items-center gap-2 rounded-md border border-[#0c110f]/20 px-4 dark:border-white/20 sm:max-w-[429px]">
              <Search className="size-5 shrink-0 text-[#0c110f]/60 dark:text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={_t["search_placeholder"] as string}
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#0c110f]/50 dark:placeholder:text-gray-500"
              />
            </label>
            <button
              type="submit"
              className="h-11 shrink-0 rounded bg-[#0c110f] px-4 text-sm font-medium text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-gray-200"
            >
              {_t["show_filter"] as string}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((o) => !o);
                  setViewOpen(false);
                }}
                className="flex h-12 min-w-[140px] items-center justify-between gap-2 rounded-md border border-[#0c110f]/20 px-4 text-xs font-medium dark:border-white/20"
              >
                <span>
                  {_t["sort_by"] as string}: {activeSortLabel}
                </span>
                <ChevronDown className="size-4 opacity-70" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-20 mt-1 w-full min-w-[140px] rounded-md border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-gray-900">
                  {sortOptions.map((option) => (
                    <button
                      key={option.sort}
                      type="button"
                      className={cn(
                        "block w-full px-3 py-2 text-left text-xs hover:bg-black/5 dark:hover:bg-white/5",
                        option.sort === activeSort && "font-semibold",
                      )}
                      onClick={() => handleSortChange(option.sort)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setViewOpen((o) => !o);
                  setSortOpen(false);
                }}
                className="flex h-12 min-w-[125px] items-center justify-between gap-2 rounded-md border border-[#0c110f]/20 bg-[#0c110f]/5 px-4 text-xs font-medium dark:border-white/20 dark:bg-white/5"
              >
                <span>
                  {view === "list"
                    ? _t["view_list"] as string
                    : _t["view_grid"] as string}
                </span>
                <ChevronDown className="size-4 opacity-70" />
              </button>
              {viewOpen && (
                <div className="absolute right-0 z-20 mt-1 w-full rounded-md border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-gray-900">
                  {(
                    [
                      { id: "list", labelKey: "view_list" as const },
                      { id: "card", labelKey: "view_grid" as const },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-black/5 dark:hover:bg-white/5"
                      onClick={() => {
                        setView(option.id);
                        setViewOpen(false);
                      }}
                    >
                      {_t[option.labelKey] as string}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#0c110f]/80 dark:text-gray-400">
          {_t["page_disclaimer"] as string}
        </p>

        <div
          className={cn(
            "mt-4",
            view === "card"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-4",
          )}
        >
          {brokers.length === 0 ? (
            <p className="py-10 text-sm text-[#0c110f]/70 dark:text-gray-400">
              {_t["no_brokers"] as string}
            </p>
          ) : (
            brokers.map((broker) => (
              <BrokerRebateCard
                key={broker.broker_id}
                broker={broker}
                view={view}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Suspense fallback={null}>
              <Pagination totalPages={totalPages} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
