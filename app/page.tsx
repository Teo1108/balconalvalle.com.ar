import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import CabinsSection from '@/components/sections/cabins-section';
import GallerySection from '@/components/sections/gallery-section';
import LocationSection from '@/components/sections/location-section';
import FaqSection from '@/components/sections/faq-section';
import ContactSection from '@/components/sections/contact-section';
import VapiWidget from '@/components/ui/vapi-widget';
import { SITE_CONFIG } from '@/lib/config';

const LODGING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: SITE_CONFIG.name,
  description:
    'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 2 a 6 personas con acceso privado al Río Atuel, rodeado de montaña y bosque nativo.',
  url: 'https://balconalvalle.com.ar',
  image:
    'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero_g2iqiz',
  dateModified: new Date().toISOString().split('T')[0],
  telephone: `+${SITE_CONFIG.whatsapp.number}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valle Grande, San Rafael',
    addressRegion: 'Mendoza',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.765827966075776,
    longitude: -68.42590132532354,
  },
  sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
  amenityFeature: [
    'Wi-Fi',
    'Cocina equipada',
    'Cochera',
    'Terraza',
    'Aire frío/calor',
    'Acceso privado al Río Atuel',
  ].map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
  })),
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LODGING_SCHEMA) }}
      />
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
