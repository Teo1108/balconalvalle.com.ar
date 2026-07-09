import type { Metadata } from 'next';
import EllieHeader from '@/components/ellie/ellie-header';
import EllieHero from '@/components/ellie/ellie-hero';
import EllieCapabilities from '@/components/ellie/ellie-capabilities';
import EllieHowItWorks from '@/components/ellie/ellie-how-it-works';
import EllieClosing from '@/components/ellie/ellie-closing';

export const metadata: Metadata = {
  title: 'Hablá con Ellie — Recepcionista 24/7 | Balcon al Valle Grande',
  description:
    'Consultá disponibilidad y reservá tu cabaña hablando con Ellie, nuestra recepcionista virtual disponible las 24 horas, los 365 días del año.',
  openGraph: {
    title: 'Hablá con Ellie — Recepcionista 24/7',
    description:
      'Consultá disponibilidad y reservá tu cabaña hablando con Ellie, disponible las 24 horas.',
    type: 'website',
  },
};

export default function EllieLandingPage() {
  return (
    <main>
      <EllieHeader />
      <EllieHero />
      <EllieCapabilities />
      <EllieHowItWorks />
      <EllieClosing />
    </main>
  );
}
