import { notFound } from "next/navigation";
import { fetchTranslations } from "@/lib/fetchTranslations";
import { prepareTranslations } from "@/lib/translations";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { getSiteBrokerType } from "@/lib/getSiteBrokerType";
import PageTranslationProvider from "@/providers/PageTranslationProvider";
import BrokerRebateDetail from "./BrokerRebateDetail";
import { fetchSetupFormData } from "./fetchSetupFormData";

const SET_REBATES_ACCOUNT_TRANSLATION_KEY = "set_rebates_account_page";

function parseBrokerId(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

type Props = {
  params: Promise<{ locale: string; brokerSlug: string }>;
  searchParams?: Promise<{ broker_type?: string; broker_id?: string | string[]; type?: string }>;
};

export default async function BrokerRebateDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, brokerSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const brokerId = parseBrokerId(resolvedSearchParams.broker_id);
  if (brokerId === null) {
    notFound();
  }

  const zone = await getZoneFromCookie();
  const brokerType = getSiteBrokerType(resolvedSearchParams.broker_type);

  const [formData, translationSections] = await Promise.all([
    fetchSetupFormData(brokerId, locale),
    fetchTranslations({
      key: SET_REBATES_ACCOUNT_TRANSLATION_KEY,
      locale,
      zone,
      sections: ["client"],
    }),
  ]);
  const clientTranslations = prepareTranslations(translationSections.client, {
    resource: SET_REBATES_ACCOUNT_TRANSLATION_KEY,
    section: "client",
    locale,
    zone,
  });

  return (
    <PageTranslationProvider
      translations={clientTranslations}
      context={{ resource: SET_REBATES_ACCOUNT_TRANSLATION_KEY, section: "client", locale, zone }}
    >
      <BrokerRebateDetail
        broker={{ broker_id: brokerId, trading_name: formData.trading_name, logo: formData.logo }}
        brokerSlug={brokerSlug}
        locale={locale}
        brokerType={brokerType}
        formData={formData}
      />
    </PageTranslationProvider>
  );
}
