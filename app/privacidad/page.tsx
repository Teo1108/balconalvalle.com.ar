import type { Metadata } from 'next';
import { SITE_CONFIG, whatsappUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Política de privacidad | Balcón al Valle',
  description:
    'Cómo Balcón al Valle Grande y su asistente virtual Ellie tratan los datos personales de quienes consultan y reservan.',
  alternates: { canonical: 'https://balconalvalle.com.ar/privacidad' },
};

const UPDATED = '14 de octubre de 2026';
const CONTACT_EMAIL = 'fbalda@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-valle-dark">{title}</h2>
      <div className="mt-3 space-y-3 text-valle-dark/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-valle-cream px-4 py-10">
      <div className="container mx-auto max-w-3xl">
        <a href="/" className="text-lg font-bold text-valle-dark">
          Balcon al Valle
        </a>

        <header className="mt-8">
          <h1 className="text-3xl font-bold text-valle-dark sm:text-4xl">Política de privacidad</h1>
          <p className="mt-2 text-sm text-valle-dark/60">Última actualización: {UPDATED}</p>
        </header>

        <Section title="Quiénes somos">
          <p>
            {SITE_CONFIG.name} es un complejo de cabañas en Valle Grande, San Rafael, Mendoza,
            Argentina. Esta política explica qué datos personales recibimos cuando nos consultás o
            reservás por este sitio web, por Instagram, por Facebook Messenger, por WhatsApp o
            conversando con Ellie, nuestra recepcionista virtual, y qué hacemos con ellos.
          </p>
        </Section>

        <Section title="Qué datos recibimos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Nombre y apellido.</li>
            <li>Teléfono y correo electrónico.</li>
            <li>Fechas de la estadía, cantidad de personas, cabaña elegida y pedidos especiales.</li>
            <li>
              Los mensajes que nos escribís y, si hablás con Ellie por voz, la grabación y la
              transcripción de la conversación.
            </li>
            <li>
              Si nos escribís por Instagram o Messenger: el identificador de tu cuenta que nos
              comparte Meta para poder responderte.
            </li>
            <li>Datos técnicos básicos, como la dirección IP, para evitar abusos del servicio.</li>
          </ul>
        </Section>

        <Section title="Para qué los usamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Responder tus consultas y consultar la disponibilidad de las cabañas.</li>
            <li>Registrar tu pre-reserva y tu reserva, y enviarte los datos por correo electrónico.</li>
            <li>Coordinar el pago de la seña, el check-in y lo que necesites durante tu estadía.</li>
            <li>Mejorar el servicio y prevenir usos indebidos.</li>
          </ul>
          <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
        </Section>

        <Section title="Con quién se comparten">
          <p>
            Para funcionar usamos servicios de terceros que procesan los datos solo para prestarnos
            ese servicio:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Vapi: asistente virtual Ellie (chat y voz).</li>
            <li>Google (Calendar y Gmail): calendario de reservas y envío de correos.</li>
            <li>Airtable: registro de reservas.</li>
            <li>n8n: automatización que conecta estos servicios.</li>
            <li>Meta (Instagram y Facebook Messenger): cuando nos escribís por esos canales.</li>
            <li>Booking.com: sincronización de la disponibilidad de las cabañas.</li>
            <li>Vercel: alojamiento de este sitio web.</li>
          </ul>
          <p>
            Algunos de estos servicios pueden almacenar datos fuera de Argentina. También podemos
            compartir datos si una autoridad competente lo exige por ley.
          </p>
        </Section>

        <Section title="Cuánto tiempo los guardamos">
          <p>
            Guardamos los datos de las reservas mientras sean necesarios para gestionarlas y para
            cumplir obligaciones legales y contables. Las conversaciones que no terminan en una
            reserva se eliminan o anonimizan en un plazo razonable.
          </p>
        </Section>

        <Section title="Tus derechos">
          <p>
            Podés pedirnos en cualquier momento acceder a tus datos, corregirlos o eliminarlos,
            conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina.
            Escribinos a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-valle-brown underline">
              {CONTACT_EMAIL}
            </a>{' '}
            o por{' '}
            <a
              href={whatsappUrl('Hola, quiero consultar sobre mis datos personales')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-valle-brown underline"
            >
              WhatsApp
            </a>
            . Te respondemos dentro de los 10 días hábiles.
          </p>
          <p>
            Si escribiste por Instagram o Messenger y querés que borremos esos datos, también podés
            pedirlo por el mismo chat.
          </p>
          <p className="text-sm">
            La Agencia de Acceso a la Información Pública, como órgano de control de la Ley 25.326,
            tiene la atribución de atender las denuncias y reclamos que se interpongan con relación
            al incumplimiento de las normas sobre protección de datos personales.
          </p>
        </Section>

        <Section title="Cambios a esta política">
          <p>
            Si cambiamos esta política, publicamos la nueva versión en esta misma página con su
            fecha de actualización.
          </p>
        </Section>
      </div>
    </main>
  );
}
