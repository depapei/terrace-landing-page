import { AboutSection } from "@/components/landing/AboutSection";
import { ContactCTA } from "@/components/landing/ContactCTA";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { HeroIntro } from "@/components/landing/HeroIntro";
import { Navbar } from "@/components/landing/Navbar";
import { PartnerMarquee } from "@/components/landing/PartnerMarquee";
import { PrinciplesSection } from "@/components/landing/PrinciplesSection";
import { SolutionsSection } from "@/components/landing/SolutionsSection";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { getLandingData } from "@/lib/data/landing";

export default async function HomePage() {
  const { heroSlides, solutions, partners, achievements } = await getLandingData();

  return (
    <>
      <Navbar />
      <main>
        <HeroCarousel slides={heroSlides} intro={<HeroIntro />} />
        <PartnerMarquee partners={partners} />
        <SolutionsSection solutions={solutions} />
        <AboutSection />
        <PrinciplesSection />
        <FAQSection />
        <ContactCTA />
      </main>
      <Footer partners={partners} achievements={achievements} />
      <WhatsAppButton />
    </>
  );
}
