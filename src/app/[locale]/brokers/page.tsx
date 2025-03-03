import MyComponent from "@/components/MyComponent";
import { TranslationProvider } from "@/components/providers/translations";
import { BASE_URL } from "@/constants";
import { buildBrokerUrl } from "@/lib/buildBrokerUrl";
import { BrokersSearchParams } from "@/types";
export const dynamic = "force-dynamic";



type Params = { locale: string };

interface BrokerPageProps {
  searchParams?: Promise<BrokersSearchParams>;
  params: Promise<Params>;
}
export default async function Brokers({
  searchParams,
  params,
}: BrokerPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const t = await getTranslations();
  const [data, totalPages] = await getBrokers(
    resolvedParams.locale,
    resolvedSearchParams
  );

  console.log("translations", t.main_header);
  console.log("==================brokers", totalPages);

  return (
    <>
      Start zustand11
      <TranslationProvider translations={t}>
        <MyComponent />
      </TranslationProvider>
    </>
  );
}

const getTranslations = async () => {
  const res = await fetch(
    `${BASE_URL}/locale_resources?key[eq]=brokers&group[eq]=page&lang[eq]=en`,
    { next: { revalidate: 7200 } }
  );
  const t = await res.json();
  return t.data[0].value;
};

const getBrokers = async (
  locale: string,
  searchParams?: BrokersSearchParams
) => {
  const url = buildBrokerUrl(locale, searchParams);
  console.log("url=========================", url);

  const res = await fetch(url, { cache: "no-store" });

  const brokers = await res.json();

  return [brokers.data, Math.ceil(brokers.meta.total / brokers.meta.per_page)];
  //backend tested with http://localhost:8000/api/v1/brokers?language[eq]=ro&page=1&columns[in]=trading_name,trading_fees,account_type,jurisdictions,promotion_title,fixed_spreads,support_options&order_by[eq]=+account_type
};
