const STEPS = [
  {
    number: '1',
    title: 'Elegí voz o texto',
    description: 'Hablá o escribile a Ellie, como prefieras.',
  },
  {
    number: '2',
    title: 'Contale qué necesitás',
    description:
      'Fechas, cantidad de personas, la cabaña que te interesa o cualquier duda.',
  },
  {
    number: '3',
    title: 'Reservá al instante',
    description:
      'Ellie resuelve tu consulta o confirma tu reserva, sin esperar respuesta.',
  },
];

export default function EllieHowItWorks() {
  return (
    <section className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-16">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-valle-brown text-white flex items-center justify-center text-2xl font-bold">
                {number}
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
