import { Suspense } from "react";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { fetchTranslations } from "@/lib/fetchTranslations";
import { getSiteBrokerType } from "@/lib/getSiteBrokerType";
import PageTranslationProvider from "@/providers/PageTranslationProvider";
import ComparePageContent from "./ComparePageContent";
import CompareTableData from "./CompareTableData";
import CompareTableSkeleton from "./CompareTableSkeleton";
import { getCategoryTab } from "./category-tabs";

const TRANSLATION_KEY = "forex_brokers_compare_page";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const brokerType = getSiteBrokerType(resolvedSearchParams.broker_type);
  const zone = await getZoneFromCookie();
  const clientTranslations = await fetchTranslations({
    key: TRANSLATION_KEY,
    locale,
    zone,
  });
  const activeTabLabel = clientTranslations[getCategoryTab(brokerType).labelKey];

  return (
    <PageTranslationProvider
      translations={clientTranslations}
      context={{ resource: TRANSLATION_KEY, section: "client", locale, zone }}
    >
      <ComparePageContent brokerType={brokerType}>
        <Suspense fallback={<CompareTableSkeleton />}>
          <CompareTableData
            locale={locale}
            brokerType={brokerType}
            activeTabLabel={activeTabLabel}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </ComparePageContent>
    </PageTranslationProvider>
  );
}
