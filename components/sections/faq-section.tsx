const FAQS = [
  {
    question: '¿Dónde están ubicadas las cabañas?',
    answer:
      'Balcón al Valle está en el distrito de Valle Grande, dentro del Cañón del Atuel, a 15 minutos del centro de San Rafael, Mendoza, a 200 metros del Río Atuel, con acceso privado desde el loteo. Compartimos la ubicación exacta al confirmar la reserva.',
  },
  {
    question: '¿Cuántas personas pueden alojarse?',
    answer:
      'Tenemos cabañas para distintos grupos: la Cabaña 1 aloja hasta 3 personas y la Cabaña 2 hasta 4 personas. La Cabaña 3, que está en construcción, también será para 4 personas.',
  },
  {
    question: '¿Qué actividades hay cerca?',
    answer:
      'Estamos en plena zona turística del Cañón del Atuel: rafting, tirolesa y trekking a pocos minutos, además del acceso privado al río desde el loteo, a solo 200 metros.',
  },
  {
    question: '¿Qué comodidades tienen las cabañas?',
    answer:
      'Las cabañas cuentan con Wi-Fi, aire frío/calor, cocina equipada, parrilla individual, ropa de cama y toallas incluidas, cochera y terraza con vista a la montaña y al valle. Además, el complejo tiene piscina de 4 x 6 metros y 2 metros de profundidad.',
  },
  {
    question: '¿Aceptan mascotas?',
    answer: 'Sí, las mascotas son bienvenidas en Balcón al Valle.',
  },
  {
    question: '¿Cuál es el horario de check-in y check-out?',
    answer:
      'El check-in es a partir de las 13:00 y el check-out hasta las 10:00. Si lo avisás con anticipación, podemos ser flexibles: lo coordinamos por WhatsApp al confirmar tu reserva.',
  },
  {
    question: '¿Cómo reservo o consulto disponibilidad?',
    answer:
      'Escribinos por WhatsApp y te confirmamos disponibilidad, precios y todos los detalles de tu estadía.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
};

export default function FaqSection() {
  return (
    <section id="preguntas-frecuentes" className="bg-valle-cream py-20 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-4xl font-bold text-valle-dark text-center mb-12">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          {FAQS.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-valle-sand/30 bg-white/60 p-6 open:bg-white"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between text-lg font-semibold text-valle-dark">
                {question}
                <span className="ml-4 shrink-0 text-valle-brown transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-valle-dark/80">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
