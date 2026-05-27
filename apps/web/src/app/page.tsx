import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { Stats } from "@/components/home/stats";
import { PromoBanner } from "@/components/home/promo-banner";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <PromoBanner />
    </>
  );
}
