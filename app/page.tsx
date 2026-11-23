import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import CabinsSection from '@/components/sections/cabins-section';
import GallerySection from '@/components/sections/gallery-section';
import LocationSection from '@/components/sections/location-section';
import FaqSection from '@/components/sections/faq-section';
import ContactSection from '@/components/sections/contact-section';
import VapiWidget from '@/components/ui/vapi-widget';

// Los datos estructurados (LodgingBusiness, WebSite, Organization) se
// insertan en el <head> desde app/layout.tsx — ver lib/structured-data.ts.

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CabinsSection />
      <GallerySection />
      <LocationSection />
      <FaqSection />
      <ContactSection />
      <VapiWidget />
    </main>
  );
}
