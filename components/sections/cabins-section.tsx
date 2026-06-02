import type { ElementType } from 'react';
import Image from 'next/image';
import { Users, Bed, Wifi, Flame, MessageCircle, Check } from 'lucide-react';
import { whatsappUrl } from '@/lib/config';

const CABINS = [
  {
    name: 'Cabaña 1',
    image:
      'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/cabania1_ohy02m',
    capacity: 4,
    beds: 3,
    amenities: ['Wi-Fi', 'Aire frio/calor', 'Cocina equipada', 'Cochera', 'Terraza'],
  },
  {
    name: 'Cabaña 2',
    image:
      'https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/cabania2_h2qmrf',
    capacity: 6,
    beds: 4,
    amenities: ['Wi-Fi', 'Aire frio/calor', 'Cocina equipada', 'Cochera', 'Terraza'],
  },
  {
    name: 'En construccion',
    image:
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=800&auto=format&fit=crop',
    capacity: 2,
    beds: 1,
    amenities: ['Wi-Fi', 'Estufa', 'Cocina completa', 'Vista al valle'],
  },
];

const AMENITY_ICONS: Record<string, ElementType> = {
  'Wi-Fi': Wifi,
  Chimenea: Flame,
  Estufa: Flame,
};

export default function CabinsSection() {
  return (
    <section id="cabanas" className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-valle-dark text-center mb-4">
          Nuestras Cabañas
        </h2>
        <p className="text-center text-valle-dark/70 mb-16">
          Cada cabaña es única. Elegí la que más se adapte a tu grupo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CABINS.map((cabin) => (
            <div
              key={cabin.name}
              className="rounded-2xl overflow-hidden shadow-lg border border-valle-sand/30 flex flex-col"
            >
              <div className="relative h-56">
                <Image
                  src={cabin.image}
                  alt={cabin.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1 bg-valle-cream">
                <h3 className="text-2xl font-bold text-valle-dark mb-3">
                  {cabin.name}
                </h3>
                <div className="flex gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1 text-valle-dark/70">
                    <Users size={15} />
                    {cabin.capacity} personas
                  </span>
                  <span className="flex items-center gap-1 text-valle-dark/70">
                    <Bed size={15} />
                    {cabin.beds} {cabin.beds === 1 ? 'cama' : 'camas'}
                  </span>
                </div>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {cabin.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity] ?? Check;
                    return (
                      <li
                        key={amenity}
                        className="flex items-center gap-2 text-valle-dark/70 text-sm"
                      >
                        <Icon size={14} className="text-valle-brown shrink-0" />
                        {amenity}
                      </li>
                    );
                  })}
                </ul>
                <a
                  href={whatsappUrl(
                    `Hola, quiero consultar disponibilidad para ${cabin.name}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <MessageCircle size={18} />
                  Reservar por WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
