const STEPS = [
  {
    number: '1',
    title: 'Elegí voz o texto',
    description: 'Hablá o escribile a Ellie, como prefieras, desde tu celular o computadora.',
  },
  {
    number: '2',
    title: 'Contale qué necesitás',
    description:
      'Fechas, cantidad de personas, la cabaña que te interesa o cualquier duda puntual.',
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
    <section className="bg-ellie-surface py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-ellie-serif text-3xl md:text-4xl font-bold text-ellie-primary mb-16">
          Cómo funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-ellie-outline-variant -z-10" />
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-ellie-primary text-white flex items-center justify-center text-2xl font-bold ring-8 ring-ellie-surface relative z-10">
                {number}
              </div>
              <h3 className="font-ellie-serif text-xl text-ellie-primary">{title}</h3>
              <p className="text-ellie-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
