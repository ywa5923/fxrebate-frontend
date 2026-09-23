"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Share2 } from "lucide-react";
import { useTranslation, type Translations } from "@/providers/translations";
import type { HighestRebateBroker } from "@/types";
import { forexRebatesListHref, type SiteBrokerType } from "./data";

type Props = {
  broker: HighestRebateBroker;
  locale: string;
  brokerType: SiteBrokerType;
  children: ReactNode;
};

function t(translations: Translations, key: string, fallback: string): string {
  const value = translations[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

const SETUP_TABS = [
  { id: "new", key: "setup_path_new", fallback: "New Trading account" },
  {
    id: "transfer",
    key: "setup_path_transfer",
    fallback: "Transfer an existing account",
  },
  {
    id: "partner",
    key: "setup_path_partner",
    fallback: "Become 4XC Partner",
  },
] as const;

export default function BrokerRebateSetupLayout({
  broker,
  locale,
  brokerType,
  children,
}: Props) {
  const translations = useTranslation() as Translations;
  const listHref = forexRebatesListHref(locale, brokerType);
  const initials = broker.trading_name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
    { label: t(translations, "breadcrumb_home", "Home"), href: "/" + locale },
    {
      label: t(translations, "breadcrumb_forex_brokers", "Forex Broker"),
      href: "/" + locale + "/forex-brokers",
    },
    {
      label: t(translations, "breadcrumb_forex_rebates", "Forex Brokers Rebates"),
      href: listHref,
    },
    { label: broker.trading_name },
    { label: t(translations, "setup_cashback", "Setup Cash Back") },
  ];

  return (
    <main className="min-h-screen bg-[#fff] font-sans text-[#0c110f] transition-colors dark:bg-[#0c110f] dark:text-white">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-14 px-0 pb-16 pt-24 sm:px-6 lg:px-0 lg:pt-28">
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="min-w-0 overflow-x-auto">
              <ol className="hidden min-w-max items-center gap-[11px] text-[14px] font-medium leading-[1.11] sm:flex">
                {breadcrumbs.map((item, index) => (
                  <li key={item.label + index} className="flex items-center gap-[11px]">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="whitespace-nowrap underline-offset-2 no-underline hover:text-black/65 dark:hover:text-white/75 sm:underline"
                      >
                        {item.label}
                      </Link>
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
                  <Link
                    href={breadcrumbs[0].href ?? `/${locale}`}
                    className="whitespace-nowrap underline-offset-2 no-underline hover:text-black/65 dark:hover:text-white/75 sm:underline"
                  >
                    {breadcrumbs[0].label}
                  </Link>
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
              aria-label={t(translations, "share", "Share")}
              className="inline-flex h-[35px] w-6 shrink-0 items-center justify-center gap-2 rounded-[4px] px-0 py-1 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 md:w-[93px] md:px-2"
            >
              <span className="hidden md:inline">{t(translations, "share", "Share")}</span>
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
                {t(translations, "setup_broker_subtitle", "Competitive Pricing")}
              </p>
            </div>
          </div>

          <nav
            aria-label="Cashback setup types"
            className="flex h-[178px] w-full flex-col items-stretch rounded-lg bg-[#f3f3f3] p-1 dark:bg-[#202221] sm:h-9 sm:w-fit sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
            role="tablist"
          >
            {SETUP_TABS.map((tab) => {
              const active = tab.id === "new";
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={!active}
                  className={
                    "flex min-h-0 w-full flex-1 items-center justify-center rounded px-[19px] py-2 text-sm font-medium capitalize sm:h-7 sm:w-auto sm:flex-none " +
                    (active
                      ? "bg-[#0c110f] text-white dark:bg-white dark:text-[#0c110f]"
                      : "cursor-not-allowed text-[#0c110f]/90 dark:text-white/90")
                  }
                >
                    {tab.id === "new" ? (
                      <>
                        <span className="sm:hidden">
                          {t(translations, "setup_path_new_mobile", "New account")}
                        </span>
                        <span className="hidden sm:inline">
                          {t(translations, tab.key, tab.fallback)}
                        </span>
                      </>
                    ) : (
                      t(translations, tab.key, tab.fallback)
                    )}
                </button>
              );
            })}
          </nav>
        </section>

        <section className="flex flex-col gap-4">
          {children}
        </section>
      </div>
    </main>
  );
}
