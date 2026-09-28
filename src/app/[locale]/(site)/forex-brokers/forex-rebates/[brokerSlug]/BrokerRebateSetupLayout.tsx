"use client";

import type { KeyboardEvent, ReactNode } from "react";
import Image from "next/image";
import LocalizedLink from "@/components/LocalizedLink";
import { ChevronRight, Share2 } from "lucide-react";
import { useTranslation } from "@/providers/translations";
import type { RebateBroker } from "./BrokerRebateDetail";
import {
  brokerRebateDetailHref,
  type RebateSetupType,
} from "../data";
import { t } from "./translations";

type Props = {
  broker: RebateBroker;
  locale: string;
  brokerType: string;
  setupType: RebateSetupType;
  children: ReactNode;
};

const SETUP_TABS = [
  { id: "new", key: "setup_path_new" },
  { id: "transfer", key: "setup_path_transfer" },
  { id: "partner", key: "setup_path_partner" },
] as const;

export default function BrokerRebateSetupLayout({
  broker,
  locale,
  brokerType,
  setupType,
  children,
}: Props) {
  const translations = useTranslation();
  const listHref = `/${locale}/forex-brokers/forex-rebates?${new URLSearchParams({ broker_type: brokerType })}`;
  const initials = broker.trading_name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  function selectTab(type: RebateSetupType) {
    if (type === setupType) return;
    const url = new URL(window.location.href);
    url.searchParams.set("type", type);
    // All three forms share server data; changing tabs needs no new RSC request.
    window.history.pushState(null, "", url.pathname + url.search + url.hash);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % SETUP_TABS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index + SETUP_TABS.length - 1) % SETUP_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = SETUP_TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextTab = SETUP_TABS[nextIndex].id;
    selectTab(nextTab);
    document.getElementById(`rebate-tab-${nextTab}`)?.focus();
  }

  async function handleShare() {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: broker.trading_name, url });
      } else {
        await navigator.clipboard?.writeText(url);
      }
    } catch {
      // Sharing can be cancelled by the user.
    }
  }

  const breadcrumbs = [
    { label: t(translations, "breadcrumb_home"), href: "/" + locale },
    {
      label: t(translations, "breadcrumb_forex_brokers"),
      href: "/" + locale + "/forex-brokers",
    },
    {
      label: t(translations, "breadcrumb_forex_rebates"),
      href: listHref,
    },
    { label: broker.trading_name },
    { label: t(translations, "setup_cashback") },
  ];

  return (
    <main className="min-h-screen bg-[#fff] font-sans text-[#0c110f] transition-colors dark:bg-[#0c110f] dark:text-white">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-14 px-0 pb-16 pt-24 sm:px-6 lg:px-0 lg:pt-28">
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <nav aria-label={t(translations, "breadcrumb_aria")} className="min-w-0 overflow-x-auto">
              <ol className="hidden min-w-max items-center gap-[11px] text-[14px] font-medium leading-[1.11] sm:flex">
                {breadcrumbs.map((item, index) => (
                  <li key={item.label + index} className="flex items-center gap-[11px]">
                    {item.href ? (
                      <LocalizedLink
                        routeKey={item.href}
                        className="whitespace-nowrap underline-offset-2 no-underline hover:text-black/65 dark:hover:text-white/75 sm:underline"
                      >
                        {item.label}
                      </LocalizedLink>
                    ) : (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="size-3 shrink-0 text-black/45 dark:text-white/80" />
                    )}
                  </li>
                ))}
              </ol>
              <ol className="flex min-w-max items-center gap-[11px] text-[14px] font-medium leading-[1.11] sm:hidden">
                <li className="flex items-center gap-[11px]">
                  <LocalizedLink
                    routeKey={breadcrumbs[0].href ?? `/${locale}`}
                    className="whitespace-nowrap underline-offset-2 no-underline hover:text-black/65 dark:hover:text-white/75 sm:underline"
                  >
                    {breadcrumbs[0].label}
                  </LocalizedLink>
                  <ChevronRight className="size-3 shrink-0 text-black/45 dark:text-white/80" />
                </li>
                <li className="flex items-center gap-[11px]">
                  <span className="whitespace-nowrap">....</span>
                  <ChevronRight className="size-3 shrink-0 text-black/45 dark:text-white/80" />
                </li>
                <li className="flex items-center">
                  <span className="whitespace-nowrap">{breadcrumbs.at(-1)?.label}</span>
                </li>
              </ol>
            </nav>
            <button
              type="button"
              onClick={handleShare}
              aria-label={t(translations, "share")}
              className="inline-flex h-[35px] w-6 shrink-0 items-center justify-center gap-2 rounded-[4px] px-0 py-1 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 md:w-[93px] md:px-2"
            >
              <span className="hidden md:inline">{t(translations, "share")}</span>
              <Share2 className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-[18px]">
            <div className="relative h-[74px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-[#f3f3f3] dark:bg-black">
              {broker.logo ? (
                <Image src={broker.logo} alt={broker.trading_name + " logo"} fill sizes="82px" className="object-contain p-1" />
              ) : (
                <span className="flex size-full items-center justify-center text-sm font-bold">{initials || "?"}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 capitalize">
              <h1 className="text-[24px] font-bold leading-[1.1] sm:text-[28px]">{broker.trading_name}</h1>
              <p className="text-[18px] leading-[1.05] text-[#0c110f]/60 dark:text-white/60 sm:text-xl">
                {t(translations, "setup_broker_subtitle")}
              </p>
            </div>
          </div>

          <nav
            aria-label={t(translations, "setup_tabs_aria")}
            className="flex h-[178px] w-full flex-col items-stretch rounded-lg bg-[#f3f3f3] p-1 dark:bg-[#202221] sm:h-9 sm:w-fit sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
            role="tablist"
          >
            {SETUP_TABS.map((tab, index) => {
              const active = tab.id === setupType;
              const className =
                "flex min-h-0 w-full flex-1 items-center justify-center rounded px-[19px] py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-7 sm:w-auto sm:flex-none " +
                (active
                  ? "bg-[#0c110f] text-white dark:bg-white dark:text-[#0c110f]"
                  : "text-[#0c110f]/90 dark:text-white/90");
              const label = tab.id === "new" ? (
                <>
                  <span className="sm:hidden">
                    {t(translations, "setup_path_new_mobile")}
                  </span>
                  <span className="hidden sm:inline">
                    {t(translations, tab.key)}
                  </span>
                </>
              ) : t(translations, tab.key);

              return (
                <LocalizedLink
                  key={tab.id}
                  routeKey={brokerRebateDetailHref(locale, broker, brokerType, tab.id)}
                  prefetch={false}
                  onNavigate={(event) => {
                    event.preventDefault();
                    selectTab(tab.id);
                  }}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  id={`rebate-tab-${tab.id}`}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`rebate-panel-${tab.id}`}
                  tabIndex={active ? 0 : -1}
                  className={className + (active ? "" : " hover:bg-black/5 dark:hover:bg-white/5")}
                >
                  {label}
                </LocalizedLink>
              );
            })}
          </nav>
        </section>

        <section
          role="tabpanel"
          id={`rebate-panel-${setupType}`}
          aria-labelledby={`rebate-tab-${setupType}`}
          tabIndex={0}
          className="flex flex-col gap-4"
        >
          {children}
        </section>
      </div>
    </main>
  );
}
