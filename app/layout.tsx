import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
  description:
    'Cabañas en Valle Grande, San Rafael, Mendoza. Alojamiento rural para 2 a 6 personas rodeado de montaña y bosque nativo. Reservá tu escapada de desconexión.',
  icons: {
    icon: 'https://res.cloudinary.com/davjgtfy0/image/upload/BalconAlValle_ujkc28.ico',
  },
  openGraph: {
    title: 'Cabañas en Valle Grande, San Rafael | Balcón al Valle',
    description:
      'Alojamiento rural para 2 a 6 personas en Valle Grande, San Rafael. Wi-Fi, cocina equipada, terrazas y desconexión total en la montaña.',
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
