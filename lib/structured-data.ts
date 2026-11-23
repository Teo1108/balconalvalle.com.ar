// Datos estructurados (Schema.org JSON-LD) del sitio.
// Se insertan en el <head> desde app/layout.tsx para que Google, Bing y los
// buscadores con IA (ChatGPT, Claude, Gemini, Perplexity) los encuentren.
import { CABINS } from '@/components/sections/cabins-section';
import { SITE_CONFIG } from '@/lib/config';

const BASE_URL = 'https://balconalvalle.com.ar';

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: SITE_CONFIG.name,
  url: BASE_URL,
  inLanguage: 'es-AR',
  publisher: { '@id': `${BASE_URL}/#lodging` },
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: SITE_CONFIG.name,
  url: BASE_URL,
  logo: 'https://res.cloudinary.com/davjgtfy0/image/upload/BalconAlValle_ujkc28.ico',
  telephone: `+${SITE_CONFIG.whatsapp.number}`,
  sameAs: Object.values(SITE_CONFIG.social),
};

export const LODGING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': `${BASE_URL}/#lodging`,
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
  priceRange: 'USD 50 - 75 por noche, según temporada',
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
  hasMap: SITE_CONFIG.social.googleMaps,
  petsAllowed: true,
  sameAs: Object.values(SITE_CONFIG.social),
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
