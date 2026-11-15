"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Share2 } from "lucide-react";
import type { FilterConfig } from "@/components/FilterPanel";
import LocalizedLink from "@/components/LocalizedLink";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import ReviewsDataTable from "./ReviewsDataTable";
import type { BrokerTableColumn, BrokerTableDefaultColumn, BrokerTableRow } from "./reviews-table";

export type ClientdataTableProps = {
  locale: string;
  brokerType: string;
  brokers: BrokerTableRow[];
  columnsConfig: BrokerTableColumn[];
  defaultColumns: BrokerTableDefaultColumn[];
  filtersConfig: FilterConfig | null;
};

const CATEGORY_TABS = [
  { brokerType: "broker", label: "Forex Brokers", title: "Forex Broker Ratings & Reviews" },
  { brokerType: "crypto", label: "Crypto Exchanges", title: "Crypto Exchange Ratings & Reviews" },
  { brokerType: "prop_firm", label: "Prop Firms", title: "Prop Firm Ratings & Reviews" },
] as const;

export default function ClientdataTable(props: ClientdataTableProps) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-white dark:bg-[#0c110f]" />}>
      <ClientdataTableContent key={props.brokerType} {...props} />
    </Suspense>
  );
}

function ClientdataTableContent({
  locale,
  brokerType,
  brokers,
  columnsConfig,
  defaultColumns,
  filtersConfig,
}: ClientdataTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab =
    CATEGORY_TABS.find((tab) => tab.brokerType === brokerType) ?? CATEGORY_TABS[0];

  function getTabHref(nextBrokerType: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("broker_type", nextBrokerType);
    nextParams.delete("page");
    nextParams.delete("columns");
    nextParams.delete("order_by");
    nextParams.delete("order_direction");
    nextParams.delete("search");
    for (const key of [...nextParams.keys()]) {
      if (key.startsWith("filter_")) nextParams.delete(key);
    }
    return `${pathname}?${nextParams.toString()}`;
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: activeTab.title, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {
      // Ignore a canceled share action.
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0c110f] dark:bg-[#0c110f] dark:text-gray-100">
      <div className="mx-auto max-w-[1360px] px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pb-16 lg:pt-32">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Breadcrumb>
            <BreadcrumbList className="gap-2 text-sm text-[#0c110f]/70 dark:text-gray-400">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <LocalizedLink routeKey="/" className="hover:text-[#0c110f] dark:hover:text-white">
                    Home
                  </LocalizedLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <LocalizedLink
                    routeKey="/forex-brokers"
                    className="hover:text-[#0c110f] dark:hover:text-white"
                  >
                    Forex Brokers
                  </LocalizedLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#0c110f] dark:text-gray-100">
                  Reviews
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share reviews page"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#0c110f] hover:bg-black/5 dark:text-gray-100 dark:hover:bg-white/10"
          >
            <Share2 className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="mb-8 flex flex-col gap-2 rounded-lg bg-[#f6f6f6] p-1 dark:bg-[#202221] md:inline-flex md:h-10 md:max-w-full md:flex-row md:items-center md:gap-0 md:overflow-x-auto"
          role="tablist"
          aria-label="Broker categories"
        >
          {CATEGORY_TABS.map((tab) => {
            const selected = tab.brokerType === activeTab.brokerType;
            return (
              <Link
                key={tab.brokerType}
                href={getTabHref(tab.brokerType)}
                role="tab"
                aria-selected={selected}
                className={cn(
                  "flex h-11 items-center justify-center rounded-md px-4 text-base font-medium transition-colors md:h-8 md:min-w-[160px] md:px-5 md:text-sm",
                  selected
                    ? "bg-[#0c110f] text-white shadow-sm dark:bg-white dark:text-[#0c110f]"
                    : "bg-transparent text-[#0c110f]/75 hover:text-[#0c110f] dark:text-white/80 dark:hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mb-10 max-w-[1040px]">
          <div className="mb-4 flex items-center gap-3 text-xs sm:text-sm">
            <span className="font-normal">Last updated</span>
            <span className="font-medium text-base">December,2024</span>
          </div>
          <h1 className="text-[32px] font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[56px]">
            {activeTab.title}
          </h1>
          <p className="mt-5 max-w-[1000px] text-sm leading-relaxed text-[#0c110f]/80 dark:text-white/80">
            Reliable ratings based on up to 6 importance-weighted categories including real customer
            reviews from customers who have synced their live trading account, as well as regulation
            strength, broker popularity and web traffic, pricing, features &amp; customer support.
          </p>
        </div>

        <ReviewsDataTable
          brokers={brokers}
          columnsConfig={columnsConfig}
          defaultColumns={defaultColumns}
          filtersConfig={filtersConfig}
          activeTabLabel={activeTab.label}
        />
      </div>
    </main>
  );
}

