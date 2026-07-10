import { Headset } from 'lucide-react';
import EllieHeroPanel from './ellie-hero-panel';

export default function EllieHero() {
  return (
    <section className="bg-ellie-surface pt-8 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full">
            🟢 Disponible ahora · Recepcionista 24/7
          </span>

          <div className="relative w-24 h-24 rounded-full bg-ellie-primary/10 flex items-center justify-center">
            <Headset size={44} className="text-ellie-primary" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-ellie-secondary border-2 border-ellie-surface animate-pulse" />
          </div>

          <h1 className="font-ellie-serif text-4xl md:text-5xl font-bold text-ellie-primary leading-tight">
            Reservá tu cabaña o resolvé tus dudas, hablando con Ellie
          </h1>
          <p className="text-lg text-ellie-on-surface-variant max-w-md">
            Nuestra recepcionista virtual te atiende las 24 horas, los 365
            días del año, para consultar disponibilidad y reservar tu cabaña
            al instante.
          </p>
        </div>

        <div id="ellie-panel" className="flex justify-center">
          <EllieHeroPanel />
        </div>
      </div>
    </section>
  );
}
