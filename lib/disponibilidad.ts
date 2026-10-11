// Disponibilidad de las cabañas a partir de feeds iCal (Google Calendar + Booking).
// Solo se expone libre/ocupado por noche: los títulos de los eventos (nombres de
// huéspedes) nunca salen del servidor.

const REVALIDATE_SECONDS = 600; // 10 min, igual que el refresco típico de Booking

export type CabinId = 'cabana1' | 'cabana2';

export const CABINS: { id: CabinId; name: string; feeds: (string | undefined)[] }[] = [
  {
    id: 'cabana1',
    name: 'Cabaña 1',
    feeds: [process.env.ICAL_CABANA1_GOOGLE, process.env.ICAL_CABANA1_BOOKING],
  },
  {
    id: 'cabana2',
    name: 'Cabaña 2',
    feeds: [process.env.ICAL_CABANA2_GOOGLE, process.env.ICAL_CABANA2_BOOKING],
  },
];

export type CabinMonth = {
  id: CabinId;
  name: string;
  // Noches ocupadas del mes, como 'YYYY-MM-DD'. null si no se pudo leer algún feed.
  busyNights: string[] | null;
};

// Argentina no tiene horario de verano: UTC-3 fijo.
const AR_OFFSET_MS = -3 * 60 * 60 * 1000;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Convierte un valor DTSTART/DTEND a fecha local de Buenos Aires ('YYYY-MM-DD').
function icsValueToLocalDate(value: string): string | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (h && z) {
    const utc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
    return toDateStr(new Date(utc + AR_OFFSET_MS));
  }
  // Fecha sola, o fecha-hora con TZID (los calendarios están en hora de Buenos Aires).
  return `${y}-${mo}-${d}`;
}

function unfold(ics: string): string[] {
  return ics.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
}

type Range = { start: string; end: string }; // end exclusivo (día de check-out)

export function parseIcsRanges(ics: string): Range[] {
  const ranges: Range[] = [];
  let start: string | null = null;
  let end: string | null = null;
  let cancelled = false;
  let inEvent = false;

  for (const line of unfold(ics)) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      start = end = null;
      cancelled = false;
    } else if (line === 'END:VEVENT') {
      if (inEvent && start && !cancelled) {
        // Evento sin DTEND o que termina el mismo día: ocupa ese día.
        const e = end && end > start ? end : nextDay(start);
        ranges.push({ start, end: e });
      }
      inEvent = false;
    } else if (inEvent) {
      const sep = line.indexOf(':');
      if (sep === -1) continue;
      const name = line.slice(0, sep).split(';')[0].toUpperCase();
      const value = line.slice(sep + 1).trim();
      if (name === 'DTSTART') start = icsValueToLocalDate(value);
      else if (name === 'DTEND') end = icsValueToLocalDate(value);
      else if (name === 'STATUS' && value.toUpperCase() === 'CANCELLED') cancelled = true;
    }
  }
  return ranges;
}

function nextDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return toDateStr(d);
}

export function monthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(Date.UTC(year, month - 1, 1));
  while (d.getUTCMonth() === month - 1) {
    days.push(toDateStr(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

async function fetchFeed(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`iCal ${res.status}`);
  const text = await res.text();
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Respuesta no es iCal');
  return text;
}

export async function getMonthAvailability(year: number, month: number): Promise<CabinMonth[]> {
  const days = monthDays(year, month);

  return Promise.all(
    CABINS.map(async (cabin) => {
      try {
        // Si falta configurar un feed preferimos no mostrar nada antes que
        // mostrar como libres noches que en realidad están ocupadas.
        if (cabin.feeds.some((url) => !url)) throw new Error('Feed sin configurar');
        const feeds = await Promise.all(cabin.feeds.map((url) => fetchFeed(url!)));
        const ranges = feeds.flatMap(parseIcsRanges);
        const busyNights = days.filter((day) =>
          ranges.some((r) => day >= r.start && day < r.end),
        );
        return { id: cabin.id, name: cabin.name, busyNights };
      } catch (err) {
        console.error(`[disponibilidad] ${cabin.id}:`, err);
        return { id: cabin.id, name: cabin.name, busyNights: null };
      }
    }),
  );
}

// Hoy en Buenos Aires, 'YYYY-MM-DD'.
export function todayAR(): string {
  return toDateStr(new Date(Date.now() + AR_OFFSET_MS));
}
