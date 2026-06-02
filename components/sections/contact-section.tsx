import { MessageCircle } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { SITE_CONFIG, whatsappUrl } from '@/lib/config';

export default function ContactSection() {
  return (
    <section id="contacto" className="bg-valle-brown py-20 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold text-valle-cream mb-4">Contacto</h2>
        <p className="text-valle-sand mb-10">
          Estamos para ayudarte. Escribinos y te respondemos a la brevedad.
        </p>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-5 rounded-2xl transition-colors text-xl mb-12 w-full md:w-auto"
        >
          <MessageCircle size={24} />
          Escribinos por WhatsApp
        </a>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
          <a
            href={SITE_CONFIG.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-valle-sand hover:text-pink-400 transition-colors"
          >
            <FaInstagram size={22} />
            @balconalvallegrande
          </a>
          <a
            href={SITE_CONFIG.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-valle-sand hover:text-blue-400 transition-colors"
          >
            <FaFacebook size={22} />
            Balcon al Valle
          </a>
        </div>

        <p className="text-valle-sand/60 text-sm">
          © 2026 Balcon al Valle Grande. Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
}
