import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { getMonthAvailability, monthDays, todayAR, type CabinMonth } from '@/lib/disponibilidad';
import { whatsappUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Disponibilidad de las cabañas | Balcón al Valle',
  description:
    'Mirá qué noches están libres en las cabañas de Balcón al Valle, Valle Grande, San Rafael, y reservá con Ellie o por WhatsApp.',
  alternates: { canonical: 'https://balconalvalle.com.ar/calendario' },
};

const MONTHS_AHEAD = 18;
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

type YearMonth = { year: number; month: number };

function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + month;
}

function toParam({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Lee ?mes=AAAA-MM y lo acota entre el mes actual y MONTHS_AHEAD meses adelante.
function resolveMonth(param: string | undefined, current: YearMonth): YearMonth {
  const m = param?.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return current;
  const requested = { year: +m[1], month: +m[2] };
  if (requested.month < 1 || requested.month > 12) return current;
  const last = shiftMonth(current, MONTHS_AHEAD);
  if (monthIndex(requested) < monthIndex(current)) return current;
  if (monthIndex(requested) > monthIndex(last)) return last;
  return requested;
}

function CabinCalendar({ cabin, days, today }: { cabin: CabinMonth; days: string[]; today: string }) {
  // Lunes = 0 … Domingo = 6
  const firstWeekday = (new Date(`${days[0]}T00:00:00Z`).getUTCDay() + 6) % 7;
  const busy = new Set(cabin.busyNights ?? []);
  const freeCount = days.filter((d) => d >= today && !busy.has(d)).length;

  return (
    <section className="rounded-2xl border border-valle-sand/40 bg-white/70 p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold text-valle-dark">{cabin.name}</h2>
        {cabin.busyNights && (
          <span className="text-sm text-valle-dark/70">
            {freeCount} {freeCount === 1 ? 'noche libre' : 'noches libres'}
          </span>
        )}
      </div>

      {cabin.busyNights === null ? (
        <p className="rounded-xl bg-valle-cream p-4 text-valle-dark/80">
          No pudimos cargar la disponibilidad de esta cabaña en este momento. Consultale a
          Ellie o escribinos por WhatsApp.
        </p>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-xs font-semibold uppercase text-valle-dark/60">
              {w}
            </div>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dayNum = Number(day.slice(8));
            const past = day < today;
            const isBusy = busy.has(day);
            const state = past ? 'pasado' : isBusy ? 'ocupado' : 'libre';
            const style = past
              ? 'text-valle-dark/25'
              : isBusy
                ? 'bg-valle-brown/85 text-white line-through decoration-white/60'
                : 'bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-200';
            return (
              <div
                key={day}
                title={`${dayNum}: ${state}`}
                aria-label={`${dayNum}, ${state}`}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm font-medium sm:text-base ${style}`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { mes?: string };
}) {
  const today = todayAR();
  const current = { year: +today.slice(0, 4), month: +today.slice(5, 7) };
  const selected = resolveMonth(searchParams.mes, current);
  const prev = shiftMonth(selected, -1);
  const next = shiftMonth(selected, 1);
  const hasPrev = monthIndex(prev) >= monthIndex(current);
  const hasNext = monthIndex(next) <= monthIndex(shiftMonth(current, MONTHS_AHEAD));

  const days = monthDays(selected.year, selected.month);
  const cabins = await getMonthAvailability(selected.year, selected.month);
  const title = `${MONTH_NAMES[selected.month - 1]} ${selected.year}`;

  const navBtn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-valle-sand/60 text-valle-dark transition-colors hover:bg-valle-sand/30';

  return (
    <main className="min-h-screen bg-valle-cream px-4 py-10">
      <div className="container mx-auto max-w-4xl">
        <a href="/" className="text-lg font-bold text-valle-dark">
          Balcon al Valle
        </a>

        <header className="mb-8 mt-8 text-center">
          <h1 className="text-3xl font-bold text-valle-dark sm:text-4xl">Disponibilidad</h1>
          <p className="mt-2 text-valle-dark/70">
            Cada casillero es una noche. Elegí tus fechas y reservá con Ellie o por WhatsApp.
          </p>
        </header>

        <div className="mb-6 flex items-center justify-center gap-4">
          {hasPrev ? (
            <a href={`/calendario?mes=${toParam(prev)}`} className={navBtn} aria-label="Mes anterior">
              <ChevronLeft size={20} />
            </a>
          ) : (
            <span className={`${navBtn} pointer-events-none opacity-30`} aria-hidden>
              <ChevronLeft size={20} />
            </span>
          )}
          <h2 className="min-w-[11rem] text-center text-xl font-semibold text-valle-dark">{title}</h2>
          {hasNext ? (
            <a href={`/calendario?mes=${toParam(next)}`} className={navBtn} aria-label="Mes siguiente">
              <ChevronRight size={20} />
            </a>
          ) : (
            <span className={`${navBtn} pointer-events-none opacity-30`} aria-hidden>
              <ChevronRight size={20} />
            </span>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-5 text-sm text-valle-dark/80">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-emerald-50 ring-1 ring-inset ring-emerald-200" /> Libre
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-valle-brown/85" /> Ocupado
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cabins.map((cabin) => (
            <CabinCalendar key={cabin.id} cabin={cabin} days={days} today={today} />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-valle-dark/60">
          La disponibilidad se actualiza cada pocos minutos. La reserva se confirma al hablar con
          Ellie o por WhatsApp.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/ellie"
            className="rounded-full bg-valle-brown px-6 py-3 font-semibold text-white transition-colors hover:bg-valle-dark"
          >
            Reservar con Ellie
          </a>
          <a
            href={whatsappUrl(`Hola, quiero reservar en ${title}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-valle-brown px-6 py-3 font-semibold text-valle-brown transition-colors hover:bg-valle-brown/10"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
