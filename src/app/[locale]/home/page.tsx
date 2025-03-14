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

export default function Home() {
  const { title: paymentTitle, methods } = ourPaymentMethods;
  const { title: partnersTitle, items: partnersItems } = ourPartners;

  return (
    <>
      <Hero />

      <div className="pb-16 lg:pt-16 lg:pb-36">
        <InfiniteImageScroll
          images={partnersItems}
          sectionTitle={partnersTitle}
        />
      </div>

      <CompanyStats />

      <WhyJoinUs />

      <WhyUs />

      <div className="mt-24 mb-36">
        <InfiniteImageScroll
          images={methods}
          sectionTitle={paymentTitle}
        />
      </div>

      <MoreAboutTrading />

      <Testimonials />

      <AnimatedTestimonials testimonials={testimonials.items} />

      <Newsletter />
    </>
  );
}
