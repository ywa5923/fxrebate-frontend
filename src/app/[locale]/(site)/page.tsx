import { ourPartners, ourPaymentMethods, testimonials } from "@/lib/content";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import logger from "@/lib/logger";

import Hero from "@/components/Hero";
import InfiniteImageScroll from "@/components/InfiniteImageScroll";
import CompanyStats from "@/components/CompanyStats";
import WhyJoinUs from "@/components/WhyJoinUs";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import AnimatedTestimonials from "@/components/AnimatedTestimonials";
import MoreAboutTrading from "@/components/MoreAboutTrading";
import { TranslationProvider } from "@/providers/translations";

const HOME_PAGE_TRANSLATION_KEY = "home_page";

type LocaleResourcesPayload = {
  client?: Record<string, string>;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const log = logger.child("site/page.tsx");
  const { locale } = await params;
  const zone = await getZoneFromCookie();

  const { title: paymentTitle, methods } = ourPaymentMethods;
  const { title: partnersTitle, items: partnersItems } = ourPartners;

  const translationsQuery = new URLSearchParams({
    "key[eq]": HOME_PAGE_TRANSLATION_KEY,
    "lang[eq]": locale,
    "section[eq]": "client",
  });
  if (zone) translationsQuery.set("zone[eq]", zone);

  const translationsUrl = `/locale_resources?${translationsQuery.toString()}`;

  const translationsResponse = await apiClient<LocaleResourcesPayload>(
    translationsUrl,
    UseTokenAuth.No,
    {
      method: "GET",
      next: {
        revalidate: 3600,
        tags: ["translations", `translations:${HOME_PAGE_TRANSLATION_KEY}`],
      },
    },
    ErrorMode.Return,
  );

  if (!translationsResponse.success) {
    log.error("Error fetching home page translations", {
      url: translationsUrl,
      message: translationsResponse.message,
      status: translationsResponse.status,
    });
  }

  const pageTranslations = translationsResponse.success
    ? (translationsResponse.data?.client ?? {})
    : {};

  return (
    <TranslationProvider translations={pageTranslations}>
      <Hero />

      <div className="pb-16 lg:pt-16 lg:pb-36">
        <InfiniteImageScroll
          images={partnersItems}
          sectionTitle={pageTranslations[partnersTitle] || partnersTitle}
        />
      </div>

      <CompanyStats />

      <WhyJoinUs />

      <WhyUs />

      <div className="mt-24 mb-36">
        <InfiniteImageScroll
          images={methods}
          sectionTitle={pageTranslations[paymentTitle] || paymentTitle}
        />
      </div>

      <MoreAboutTrading />

      <Testimonials />

      <AnimatedTestimonials testimonials={testimonials.items} />

      <Newsletter />
    </TranslationProvider>
  );
}
