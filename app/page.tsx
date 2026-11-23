import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import CabinsSection, { CABINS } from '@/components/sections/cabins-section';
import GallerySection from '@/components/sections/gallery-section';
import LocationSection from '@/components/sections/location-section';
import FaqSection from '@/components/sections/faq-section';
import ContactSection from '@/components/sections/contact-section';
import VapiWidget from '@/components/ui/vapi-widget';
import { SITE_CONFIG } from '@/lib/config';

const LODGING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': 'https://balconalvalle.com.ar/#lodging',
  name: SITE_CONFIG.name,
  alternateName: ['Balcón al Valle', 'Cabañas Balcón al Valle'],
  description:
    'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 3 a 4 personas a 200 metros del Río Atuel, con acceso privado desde el loteo, rodeado de montaña y bosque nativo.',
  url: 'https://balconalvalle.com.ar',
  image: [
    'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/v1790534583/BAVG-homemini.jpg',
    ...CABINS.filter((cabin) => !cabin.underConstruction).map(
      (cabin) => cabin.poster ?? cabin.image
    ),
  ],
  dateModified: new Date().toISOString().split('T')[0],
  telephone: `+${SITE_CONFIG.whatsapp.number}`,
  checkinTime: '13:00',
  checkoutTime: '10:00',
  numberOfRooms: CABINS.filter((cabin) => !cabin.underConstruction).length,
  currenciesAccepted: 'ARS, USD',
  paymentAccepted: 'Mercado Pago, Transferencia bancaria, Efectivo',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valle Grande, San Rafael',
    addressRegion: 'Mendoza',
    postalCode: '5600',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.765827966075776,
    longitude: -68.42590132532354,
  },
  hasMap:
    'https://www.google.com/maps/search/?api=1&query=-34.765827966075776,-68.42590132532354',
  petsAllowed: true,
  sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
  containsPlace: CABINS.filter((cabin) => !cabin.underConstruction).map(
    (cabin) => ({
      '@type': 'Accommodation',
      name: cabin.name,
      image: cabin.poster ?? cabin.image,
      occupancy: {
        '@type': 'QuantitativeValue',
        maxValue: cabin.capacity,
        unitCode: 'C62',
      },
      bed: {
        '@type': 'BedDetails',
        numberOfBeds: cabin.beds,
      },
      petsAllowed: true,
      amenityFeature: cabin.amenities.map((name) => ({
        '@type': 'LocationFeatureSpecification',
        name,
        value: true,
      })),
    })
  ),
  amenityFeature: [
    'Wi-Fi',
    'Cocina equipada',
    'Cochera',
    'Terraza',
    'Aire frío/calor',
    'Parrilla individual',
    'Ropa de cama y toallas incluidas',
    'Vista a la montaña',
    'Acceso privado al Río Atuel desde el loteo (a 200 metros)',
  ].map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
    value: true,
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
