import { ourPartners, ourPaymentMethods, testimonials } from "@/lib/content";
import { fetchTranslations } from "@/lib/fetchTranslations";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";
import { createTranslator } from "@/lib/translations";

import Hero from "@/components/Hero";
import InfiniteImageScroll from "@/components/InfiniteImageScroll";
import CompanyStats from "@/components/CompanyStats";
import WhyJoinUs from "@/components/WhyJoinUs";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import AnimatedTestimonials from "@/components/AnimatedTestimonials";
import MoreAboutTrading from "@/components/MoreAboutTrading";
import PageTranslationProvider from "@/providers/PageTranslationProvider";

const HOME_PAGE_TRANSLATION_KEY = "home_page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const zone = await getZoneFromCookie();

  const { title: paymentTitle, methods } = ourPaymentMethods;
  const { title: partnersTitle, items: partnersItems } = ourPartners;

  const pageTranslations = await fetchTranslations({ key: HOME_PAGE_TRANSLATION_KEY, locale, zone });
  const t = createTranslator(pageTranslations);

  return (
    <PageTranslationProvider
      translations={pageTranslations}
      context={{ resource: HOME_PAGE_TRANSLATION_KEY, section: "client", locale, zone }}
    >
      <Hero />

      <div className="pb-16 lg:pt-16 lg:pb-36">
        <InfiniteImageScroll
          images={partnersItems}
          sectionTitle={t(partnersTitle)}
        />
      </div>

      <CompanyStats />

      <WhyJoinUs />

      <WhyUs />

      <div className="mt-24 mb-36">
        <InfiniteImageScroll
          images={methods}
          sectionTitle={t(paymentTitle)}
        />
      </div>

      <MoreAboutTrading />

      <Testimonials />

      <AnimatedTestimonials testimonials={testimonials.items} />

      <Newsletter />
    </PageTranslationProvider>
  );
}
