import { CalendarDays } from 'lucide-react';

// Renderiza el texto de un mensaje de Ellie con los links clickeables y, si
// menciona el calendario, un botón a /calendario del mes correspondiente.
// En llamada de voz Ellie no lee la URL, así que el botón es la única forma
// de que el cliente llegue al calendario sin cortar la llamada.

const URL_REGEX = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?¡¿"'])/g;

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Devuelve 'AAAA-MM' a partir de '2026-12' o de un nombre de mes en el texto.
// Sin año explícito toma el próximo mes con ese nombre (hoy o en el futuro).
export function detectMonth(text: string): string | null {
  const iso = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])\b/);
  if (iso) return `${iso[1]}-${iso[2]}`;

  const lower = text.toLowerCase().replace('setiembre', 'septiembre');
  // Si se nombran varios meses, el último mencionado suele ser el elegido.
  const names = Array.from(lower.matchAll(new RegExp(`\\b(${MONTHS.join('|')})\\b`, 'g')));
  if (names.length === 0) return null;
  const month = MONTHS.indexOf(names[names.length - 1][1]) + 1;

  const yearMatch = lower.match(/\b(20\d{2})\b/);
  const now = new Date();
  let year = yearMatch ? Number(yearMatch[1]) : now.getFullYear();
  if (!yearMatch && month < now.getMonth() + 1) year += 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function monthLabel(mes: string): string {
  const [y, m] = mes.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

const linkClass = 'underline break-all hover:opacity-80';

export default function MessageText({
  text,
  role,
  context,
}: {
  text: string;
  role: 'user' | 'assistant';
  // Texto de mensajes anteriores, para deducir el mes si Ellie no lo nombra.
  context?: string;
}) {
  const parts = text.split(URL_REGEX);
  const hasCalendarUrl = /\/calendario/i.test(text);
  const mentionsCalendar = role === 'assistant' && /calendario/i.test(text) && !hasCalendarUrl;
  const mes = mentionsCalendar ? detectMonth(text) ?? (context ? detectMonth(context) : null) : null;

  return (
    <>
      <p className="text-sm leading-relaxed">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {part}
            </a>
          ) : (
            part
          ),
        )}
      </p>
      {mentionsCalendar && (
        <a
          href={mes ? `/calendario?mes=${mes}` : '/calendario'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-valle-brown px-3 py-1.5 text-xs font-semibold text-white hover:bg-valle-dark"
        >
          <CalendarDays size={14} />
          {mes ? `Ver calendario de ${monthLabel(mes)}` : 'Ver calendario'}
        </a>
      )}
    </>
  );
}
