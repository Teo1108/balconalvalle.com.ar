const FAQS = [
  {
    question: '¿Dónde están ubicadas las cabañas?',
    answer:
      'Balcón al Valle está en Valle Grande, San Rafael, Mendoza, rodeado de montaña y bosque nativo. Compartimos la ubicación exacta al confirmar la reserva.',
  },
  {
    question: '¿Cuántas personas pueden alojarse?',
    answer:
      'Tenemos cabañas para distintos grupos: la Cabaña 1 aloja hasta 4 personas y la Cabaña 2 hasta 6 personas.',
  },
  {
    question: '¿Qué comodidades tienen las cabañas?',
    answer:
      'Todas cuentan con Wi-Fi, aire frío/calor, cocina equipada, cochera y terraza con vista al valle.',
  },
  {
    question: '¿Aceptan mascotas?',
    answer: 'Sí, las mascotas son bienvenidas en Balcón al Valle.',
  },
  {
    question: '¿Cuál es el horario de check-in y check-out?',
    answer:
      'El horario es flexible y lo coordinamos por WhatsApp al momento de confirmar tu reserva.',
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
