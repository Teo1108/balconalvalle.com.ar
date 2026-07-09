import { Headset } from 'lucide-react';
import EllieHeroPanel from './ellie-hero-panel';

export default function EllieHero() {
  return (
    <section className="bg-valle-cream pt-8 pb-16 px-4">
      <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full">
            🟢 Disponible ahora · Recepcionista 24/7
          </span>

          <div className="relative w-24 h-24 rounded-full bg-valle-brown/10 flex items-center justify-center">
            <Headset size={44} className="text-valle-brown" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-valle-cream animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-valle-dark">
            Reservá tu cabaña o resolvé tus dudas, hablando con Ellie
          </h1>
          <p className="text-lg text-valle-dark/80 max-w-md">
            Nuestra recepcionista virtual te atiende las 24 horas, los 365
            días del año, para consultar disponibilidad y reservar tu cabaña
            al instante.
          </p>
        </div>

        <div className="flex justify-center">
          <EllieHeroPanel />
        </div>
      </div>
    </section>
  );
}
