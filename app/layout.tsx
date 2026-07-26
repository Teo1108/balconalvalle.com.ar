import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SITE_CONFIG } from '@/lib/config';

const inter = Inter({ subsets: ['latin'] });

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: 'https://balconalvalle.com.ar',
  inLanguage: 'es-AR',
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.name,
  url: 'https://balconalvalle.com.ar',
  logo: 'https://res.cloudinary.com/davjgtfy0/image/upload/BalconAlValle_ujkc28.ico',
  telephone: `+${SITE_CONFIG.whatsapp.number}`,
  sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
  description:
    'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 2 a 6 personas con acceso privado al Río Atuel, rodeado de montaña y bosque nativo.',
  alternates: {
    canonical: 'https://balconalvalle.com.ar',
  },
  icons: {
    icon: 'https://res.cloudinary.com/davjgtfy0/image/upload/BalconAlValle_ujkc28.ico',
  },
  openGraph: {
    title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
    description:
      'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 2 a 6 personas con acceso privado al Río Atuel, rodeado de montaña y bosque nativo.',
    url: 'https://balconalvalle.com.ar',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/hero_g2iqiz',
        width: 1200,
        height: 630,
        alt: 'Cabañas Balcón al Valle en Valle Grande, San Rafael',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        {children}
      </body>
    </html>
  );
}
