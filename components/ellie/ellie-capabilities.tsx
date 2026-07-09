import { CalendarCheck, Tag, MapPin, Home } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: CalendarCheck,
    title: 'Disponibilidad y reservas',
    description:
      'Consultá qué cabañas están libres en tus fechas y reservá al instante, sin esperar una respuesta.',
  },
  {
    icon: Tag,
    title: 'Precios y promociones',
    description:
      'Enterate de tarifas, descuentos y promociones vigentes para tu estadía.',
  },
  {
    icon: MapPin,
    title: 'Ubicación y cómo llegar',
    description:
      'Pedile indicaciones para llegar al complejo y recomendaciones de la zona.',
  },
  {
    icon: Home,
    title: 'Servicios y comodidades',
    description:
      'Preguntale qué incluye cada cabaña: capacidad, comodidades y servicios disponibles.',
  },
];

export default function EllieCapabilities() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-16">
          Qué puede hacer Ellie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-valle-brown/10 flex items-center justify-center">
                <Icon size={32} className="text-valle-brown" />
              </div>
              <h3 className="text-xl font-semibold text-valle-dark">{title}</h3>
              <p className="text-valle-dark/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
