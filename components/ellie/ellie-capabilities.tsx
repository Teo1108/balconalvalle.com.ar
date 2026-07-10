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
    <section className="bg-ellie-surface-low py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-ellie-serif text-3xl md:text-4xl font-bold text-ellie-primary mb-16">
          Qué puede hacer Ellie
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-ellie-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-ellie-surface-container-high flex items-center justify-center">
                <Icon size={28} className="text-ellie-primary" />
              </div>
              <h3 className="font-ellie-serif text-xl text-ellie-primary">{title}</h3>
              <p className="text-ellie-on-surface-variant leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
