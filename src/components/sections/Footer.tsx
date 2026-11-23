"use client";

import { Logo } from "@/components/ui/Logo";
import LocalizedLink from "@/components/LocalizedLink";
import { socialItems } from "@/lib/content";
import { useTranslation } from "@/providers/translations";

const FOOTER_COLUMNS = [
  {
    title: "column_rebates_reviews",
    links: [
      "forex_broker_rebates",
      "crypto_exchange_rebates",
      "prop_firm_rebates",
      "forex_broker_ratings_reviews",
      "crypto_exchange_ratings_reviews",
      "prop_firm_ratings_reviews",
    ],
  },
  {
    title: "column_promotions_trading_tools",
    links: [
      "latest_offers",
      "forex_broker_promotions",
      "crypto_exchange_promotions",
      "prop_firm_discounts_promotions",
      "trading_tools",
      "live_charts",
    ],
  },
  {
    title: "column_education_community",
    links: [
      "trading_academy",
      "forex_broker_guides",
      "crypto_exchange_guides",
      "prop_firm_guides",
      "latest_posts",
      "join_telegram_community",
    ],
  },
  {
    title: "column_fxrebate",
    links: [
      "affiliate_program",
      "about_us",
      "contact_us",
      "faqs",
      "live_chat",
      "careers",
    ],
  },
] as const;

const LEGAL_LINKS = [
  "terms_of_service",
  "privacy_policy",
  "cookie_policy",
  "affiliate_terms_of_service",
  "risk_disclosure",
] as const;

const Footer = () => {
  const { t } = useTranslation("footer");

  return (
    <footer className="mt-[150px] border-t border-black/15 pb-10 pt-12 dark:border-white/15 lg:pt-[86px]">
      <div className="custom-container lg:px-10">
        <div className="flex flex-col items-start justify-between gap-12 xl:flex-row xl:gap-16">
          <div className="shrink-0">
            <Logo />
            <div className="ml-1.5 mt-3.5 flex items-center gap-[14px]">
              {socialItems.map((item) => (
                <LocalizedLink
                  key={item.id}
                  routeKey="#"
                  aria-label={item.name}
                  className="flex size-6 items-center justify-center"
                >
                  {item.icon}
                </LocalizedLink>
              ))}
            </div>
          </div>

          <nav aria-label={t("navigation_aria_label")} className="grid w-full grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:max-w-[1030px]">
            {FOOTER_COLUMNS.map((column) => (
              <section key={column.title}>
                <h2 className="text-lg font-medium text-black dark:text-white">{t(column.title)}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((key) => (
                    <li key={key}>
                      <LocalizedLink
                        routeKey="#"
                        className="text-base font-normal text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
                      >
                        {t(key)}
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-black/15 pt-6 dark:border-white/15">
          <nav aria-label={t("legal_navigation_aria_label")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-3">
              {LEGAL_LINKS.map((key) => (
                <li key={key}>
                  <LocalizedLink
                    routeKey="#"
                    className="text-sm text-black/70 underline-offset-4 hover:underline dark:text-white/70 dark:hover:text-white"
                  >
                    {t(key)}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-black/70 dark:text-white/70">
            <span className="font-semibold text-black dark:text-white">{t("disclaimer_label")}</span>{" "}
            {t("disclaimer")}
          </p>
        </div>

        <p className="mt-8 text-center text-sm font-normal text-black/70 dark:text-white/70">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
