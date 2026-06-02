import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Balcon al Valle Grande',
  description:
    'Complejo de cabañas rodeado de naturaleza en el valle. Disfrutá de vistas únicas, aire puro y total tranquilidad.',
  icons: {
    icon: '/public/images/BalconAlValle.ico',
  },
  openGraph: {
    title: 'Balcon al Valle Grande',
    description: 'Complejo de cabañas rodeado de naturaleza en el valle.',
    type: 'website',
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
