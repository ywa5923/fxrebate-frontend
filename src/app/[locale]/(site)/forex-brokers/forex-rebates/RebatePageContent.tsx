"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2 } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/translations";
import { CATEGORY_TABS, getCategoryTab } from "./category-tabs";

type RebatePageContentProps = {
  activeBrokerType: string;
  children: ReactNode;
};

export default function RebatePageContent({
  activeBrokerType,
  children,
}: RebatePageContentProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const activeTab = getCategoryTab(activeBrokerType);
  const pageTitle = t(activeTab.titleKey);

  function getTabHref(brokerType: string) {
    return `${pathname}?${new URLSearchParams({ broker_type: brokerType }).toString()}`;
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: pageTitle, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {
      // Ignore a canceled share action.
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0c110f] dark:bg-[#0c110f] dark:text-gray-100">
      <div className="mx-auto max-w-[1360px] px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pb-16 lg:pt-32">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Breadcrumb>
            <BreadcrumbList className="text-xs text-[#0c110f]/70 dark:text-gray-400 sm:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <LocalizedLink routeKey="/" className="hover:text-[#0c110f] dark:hover:text-gray-100">
                    {t("breadcrumb_home")}
                  </LocalizedLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <LocalizedLink
                    routeKey="/forex-brokers"
                    className="hover:text-[#0c110f] dark:hover:text-gray-100"
                  >
                    {t("breadcrumb_forex_brokers")}
                  </LocalizedLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#0c110f] dark:text-gray-100">
                  {t("breadcrumb_forex_rebates")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <button
            type="button"
            onClick={handleShare}
            className="hidden h-9 shrink-0 items-center gap-2 rounded-md border border-[#0c110f]/15 px-3 text-sm font-medium text-[#0c110f] hover:bg-black/5 dark:border-white/15 dark:text-gray-100 dark:hover:bg-white/5 md:inline-flex"
          >
            {t("share")}
            <Share2 className="size-4" />
          </button>
        </div>

        <nav
          className={cn(
            "mb-8 flex flex-col gap-2 rounded-lg bg-[#f6f6f6] p-1 dark:bg-[#202221]",
            "md:mb-6 md:inline-flex md:h-9 md:max-w-full md:flex-row md:items-center md:gap-0 md:overflow-x-auto",
          )}
          role="tablist"
          aria-label={t("rebate_categories_aria")}
        >
          {CATEGORY_TABS.map((tab) => {
            const active = tab.brokerType === activeBrokerType;
            return (
              <Link
                key={tab.brokerType}
                href={getTabHref(tab.brokerType)}
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors md:h-7 md:min-w-[160px] md:px-5",
                  active
                    ? "bg-[#0c110f] text-white shadow-sm dark:bg-white dark:text-[#0c110f]"
                    : "bg-transparent text-[#0c110f]/70 hover:text-[#0c110f] dark:text-white/80 dark:hover:text-white",
                )}
              >
                {t(tab.labelKey)}
              </Link>
            );
          })}
        </nav>

        <header className="mb-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
            {pageTitle}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#0c110f]/80 dark:text-gray-300 sm:text-base">
            {t(activeTab.descriptionKey)}
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}
