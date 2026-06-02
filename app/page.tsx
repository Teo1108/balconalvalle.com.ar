import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import CabinsSection from '@/components/sections/cabins-section';
import GallerySection from '@/components/sections/gallery-section';
import LocationSection from '@/components/sections/location-section';
import ContactSection from '@/components/sections/contact-section';
import VapiButton from '@/components/ui/vapi-button';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CabinsSection />
      <GallerySection />
      <LocationSection />
      <ContactSection />
      <VapiButton />
    </main>
  );
}
