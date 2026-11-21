"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Share2 } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/translations";
import { CATEGORY_TABS, getCategoryTab } from "./category-tabs";

export type ComparePageContentProps = {
  brokerType: string;
  children: ReactNode;
};

export default function ComparePageContent(props: ComparePageContentProps) {
  return <ComparePageContentContent key={props.brokerType} {...props} />;
}

function ComparePageContentContent({
  brokerType,
  children,
}: ComparePageContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const activeTab = getCategoryTab(brokerType);
  const pageTitle = t(activeTab.titleKey);

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
      if (navigator.share) await navigator.share({ title: pageTitle, url });
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
                    {t("breadcrumb_home")}
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
                    {t("breadcrumb_forex_brokers")}
                  </LocalizedLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#0c110f] dark:text-gray-100">
                  {t("breadcrumb_reviews")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <button
            type="button"
            onClick={handleShare}
            aria-label={t("share_reviews_page_aria")}
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#0c110f] hover:bg-black/5 dark:text-gray-100 dark:hover:bg-white/10"
          >
            <Share2 className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="mb-8 flex flex-col gap-2 rounded-lg bg-[#f6f6f6] p-1 dark:bg-[#202221] md:inline-flex md:h-10 md:max-w-full md:flex-row md:items-center md:gap-0 md:overflow-x-auto"
          role="tablist"
          aria-label={t("broker_categories_aria")}
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
                {t(tab.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mb-10 max-w-[1040px]">
          <h1 className="text-[32px] font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[56px]">
            {pageTitle}
          </h1>
          <p className="mt-5 max-w-[1000px] text-sm leading-relaxed text-[#0c110f]/80 dark:text-white/80">
            {t(activeTab.descriptionKey)}
          </p>
        </div>

        <Accordion type="single" collapsible className="mb-10 max-w-[1040px] space-y-3">
          <InfoAccordionItem
            value="high-risk-trading"
            title={t("page_title_high_risk_trading")}
            description={t("page_description_high_risk_trading")}
          />
          <InfoAccordionItem
            value="advertising-disclosure"
            title={t("page_title_advertising_disclosure")}
            description={t("page_description_advertising_disclosure")}
          />
        </Accordion>

        {children}
      </div>
    </main>
  );
}

function InfoAccordionItem({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description: string;
}) {
  const paragraphs = description.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim());

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-xl border border-[#0c110f]/10 bg-[#f8f9f8] px-5 last:border-b dark:border-white/10 dark:bg-[#151918]"
    >
      <AccordionTrigger className="py-5 text-left text-base font-semibold tracking-tight hover:no-underline sm:text-lg [&>svg]:size-5">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-5">
        <div className="space-y-4 text-sm leading-relaxed text-[#0c110f]/80 dark:text-white/75">
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

