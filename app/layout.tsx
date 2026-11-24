import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import {
  LODGING_SCHEMA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/structured-data';

const inter = Inter({ subsets: ['latin'] });

const STRUCTURED_DATA = [WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, LODGING_SCHEMA];

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
  description:
    'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 3 a 4 personas a 200 metros del Río Atuel, con acceso privado desde el loteo, rodeado de montaña y bosque nativo. Complejo con piscina.',
  alternates: {
    canonical: 'https://balconalvalle.com.ar',
  },
  icons: {
    icon: 'https://res.cloudinary.com/davjgtfy0/image/upload/BalconAlValle_ujkc28.ico',
  },
  openGraph: {
    title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
    description:
      'Cabañas en Valle Grande, dentro del Cañón del Atuel, San Rafael, Mendoza. Alojamiento rural para 3 a 4 personas a 200 metros del Río Atuel, con acceso privado desde el loteo, rodeado de montaña y bosque nativo. Complejo con piscina.',
    url: 'https://balconalvalle.com.ar',
    siteName: 'Balcón al Valle Grande',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/v1790534583/BAVG-homemini.jpg',
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
    <html lang="es-AR">
      <head>
        {STRUCTURED_DATA.map((schema) => (
          <script
            key={schema['@type']}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
