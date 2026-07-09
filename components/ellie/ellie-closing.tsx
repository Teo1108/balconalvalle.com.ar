import Link from 'next/link';
import { whatsappUrl } from '@/lib/config';

export default function EllieClosing() {
  return (
    <section className="bg-valle-brown py-16 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="text-2xl font-bold text-valle-cream mb-4">
          Disponible 24/7, los 365 días del año
        </p>
        <p className="text-valle-sand mb-8">
          ¿Preferís otro medio? Escribinos por WhatsApp o volvé al inicio para
          conocer más sobre nuestras cabañas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-valle-cream underline hover:text-white transition-colors"
          >
            Escribinos por WhatsApp
          </a>
          <Link
            href="/"
            className="text-valle-cream underline hover:text-white transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
