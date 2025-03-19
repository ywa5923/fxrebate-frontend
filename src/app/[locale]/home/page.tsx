
import { ourPartners, ourPaymentMethods, testimonials } from "@/lib/content";

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
import { getTranslations } from "@/lib/getTranslations";

export default async function Home() {
  const { title: paymentTitle, methods } = ourPaymentMethods;
  const { title: partnersTitle, items: partnersItems } = ourPartners;

  const _t=await getTranslations("ro","eu","home_page","client");
  console.log(_t)

  return (
    <>
    <TranslationProvider translations={_t.client}>
       <Hero />
     
       <div className="pb-16 lg:pt-16 lg:pb-36">
        <InfiniteImageScroll
          images={partnersItems}
          sectionTitle={_t.client[partnersTitle]||partnersTitle}
        />
      </div>

      <CompanyStats />

      <WhyJoinUs />

      <WhyUs />

      <div className="mt-24 mb-36">
        <InfiniteImageScroll
          images={methods}
          sectionTitle={_t.client[paymentTitle]||paymentTitle}
        />
      </div>
     

      <MoreAboutTrading />

       <Testimonials />

       <AnimatedTestimonials testimonials={testimonials.items} />

        <Newsletter />
      </TranslationProvider>
    </>
  );
}
