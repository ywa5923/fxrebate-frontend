import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { getSiteBrokerType } from "@/lib/getSiteBrokerType";
import { fetchTranslations } from "@/lib/fetchTranslations";
import PageTranslationProvider from "@/providers/PageTranslationProvider";
import { Suspense } from "react";
import RebatePageContent from "./RebatePageContent";
import RebatesData from "./RebatesData";
import RebatesSkeleton from "./RebatesSkeleton";

const TRANSLATION_KEY = "forex_rebates_page";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    page?: string;
    per_page?: string;
    trading_name?: string;
    order_by?: string;
    order_direction?: string;
    broker_type?: string;
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function ForexRebatesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const zone = await getZoneFromCookie();

  const brokerType = getSiteBrokerType(resolvedSearchParams.broker_type);

  const clientTranslations = await fetchTranslations({
    key: TRANSLATION_KEY,
    locale,
    zone,
  });

  return (
    <PageTranslationProvider
      translations={clientTranslations}
      context={{ resource: TRANSLATION_KEY, section: "client", locale, zone }}
    >
      <RebatePageContent activeBrokerType={brokerType}>
        <Suspense fallback={<RebatesSkeleton />}>
          <RebatesData
            locale={locale}
            zone={zone}
            brokerType={brokerType}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </RebatePageContent>
    </PageTranslationProvider>
  );
}
