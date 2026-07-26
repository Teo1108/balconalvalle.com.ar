import { TreePine, Mountain, Sun, Waves } from 'lucide-react';

const FEATURES = [
  {
    icon: TreePine,
    title: 'Naturaleza y tranquilidad',
    description:
      'Rodeados de bosques nativos, aire puro y el sonido del viento entre los árboles.',
  },
  {
    icon: Mountain,
    title: 'Vistas panorámicas',
    description:
      'Contempla el imponente valle y las cumbres desde la comodidad de tu cabaña.',
  },
  {
    icon: Sun,
    title: 'Atardeceres únicos',
    description:
      'Cada tarde el cielo se pinta de colores irrepetibles sobre el horizonte del valle.',
  },
  {
    icon: Waves,
    title: 'Acceso privado al Río Atuel',
    description:
      'Las cabañas tienen acceso privado al Río Atuel, en plena zona del Cañón del Atuel: rafting, tirolesa y trekking a pocos minutos.',
  },
];

export default function AboutSection() {
  return (
    <section className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-6">
          Un rincón de paz en el valle
        </h2>
        <p className="text-lg text-valle-dark/80 mb-4 max-w-2xl mx-auto">
          Balcón al Valle está en el distrito de Valle Grande, dentro de la
          región conocida como Cañón del Atuel, a solo 15 minutos del centro
          de San Rafael, Mendoza. Un complejo de cabañas pensado para quienes
          buscan desconectarse, respirar montaña y vivir la naturaleza en su
          estado más puro. Un lugar para volver.
        </p>
        <p className="text-lg text-valle-dark/80 mb-16 max-w-2xl mx-auto">
          Estamos en plena zona turística del cañón, con actividades como
          rafting, tirolesa y trekking a minutos de la cabaña, y acceso
          privado al Río Atuel para disfrutar del agua sin salir del predio.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {FEATURES.map(({ icon: Icon, title, description }) => (
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
