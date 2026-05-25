import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { ValueProps } from "@/components/home/value-props";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Stats } from "@/components/home/stats";
import { Categories } from "@/components/home/categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { PromoBanner } from "@/components/home/promo-banner";

export default function Home() {
  return (
    <>
      {/* Hero includes the floating Header */}
      <Hero />
      <Marquee />
      <ValueProps />
      <FeaturedProducts />
      <Stats />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <PromoBanner />
    </>
  );
}
