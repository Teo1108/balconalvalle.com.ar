import { MapPin, MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/config';

export default function LocationSection() {
  return (
    <section id="ubicacion" className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3277.593637299847!2d-68.42590132532354!3d-34.765827966075776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9679a503a2d7d6c9%3A0x725cecbf0fe47c8c!2sBalcon%20al%20Valle%20Grande!5e0!3m2!1ses!2sar!4v1780353645435!5m2!1ses!2sar"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <div className="w-16 h-16 rounded-full bg-valle-brown/10 flex items-center justify-center mx-auto mb-6">
          <MapPin size={32} className="text-valle-brown" />
        </div>
        <h2 className="text-4xl font-bold text-valle-dark mb-6">
          ¿Cómo llegar?
        </h2>
        <p className="text-lg text-valle-dark/80 mb-4">
          Balcon al Valle Grande se encuentra en un entorno natural privilegiado,
          rodeado de montañas y bosques nativos. Fácil acceso desde las
          principales rutas de la región.
        </p>
        <p className="text-valle-dark/70 mb-10">
          Para darte las indicaciones más precisas según tu punto de partida,
          compartimos la ubicación exacta al confirmar la reserva.
        </p>
        <a
          href={whatsappUrl(
            'Hola, quiero saber cómo llegar a Balcon al Valle Grande'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          <MessageCircle size={20} />
          Consultar ubicación por WhatsApp
        </a>
      </div>
    </section>
  );
}
