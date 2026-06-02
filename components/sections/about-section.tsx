import { TreePine, Mountain, Sun } from 'lucide-react';

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
];

export default function AboutSection() {
  return (
    <section className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-6">
          Un rincón de paz en el valle
        </h2>
        <p className="text-lg text-valle-dark/80 mb-16 max-w-2xl mx-auto">
          Balcon al Valle Grande es un complejo de cabañas pensado para quienes
          buscan desconectarse, respirar montaña y vivir la naturaleza en su
          estado más puro. Un lugar para volver.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
