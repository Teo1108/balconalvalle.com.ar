import { NextResponse } from 'next/server';
import { CABINS } from '@/lib/disponibilidad';

// Diagnóstico: dice qué feed iCal falla y por qué, sin mostrar los links
// (solo el comienzo del token, para saber qué versión está cargada).
export const dynamic = 'force-dynamic';

const FEED_NAMES = ['google', 'booking'];

export async function GET() {
  const estado = await Promise.all(
    CABINS.flatMap((cabin) =>
      cabin.feeds.map(async (url, i) => {
        const feed = `${cabin.name} - ${FEED_NAMES[i]}`;
        if (!url) return { feed, ok: false, error: 'variable sin configurar' };
        const token = (url.match(/[?&]t=([^&]{0,8})/) || url.match(/ical\/([^/]{0,8})/) || [])[1] || '';
        try {
          const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
          const text = await res.text();
          const ok = res.ok && text.includes('BEGIN:VCALENDAR');
          return { feed, token, ok, status: res.status, eventos: (text.match(/BEGIN:VEVENT/g) || []).length };
        } catch (e) {
          return { feed, token, ok: false, error: (e as Error).message };
        }
      }),
    ),
  );
  return NextResponse.json(estado);
}
