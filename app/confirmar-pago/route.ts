import { NextRequest } from 'next/server';

// Botón "Confirmar pago recibido" del mail de aviso de pre-reserva.
// Pasa por nuestro dominio porque Chrome marca como peligrosa la dirección de
// n8n en Render. n8n verifica la firma y responde la página HTML.
const N8N_CONFIRMAR_URL =
  process.env.N8N_CONFIRMAR_PAGO_URL ?? 'https://n8n-mg0e.onrender.com/webhook/confirmar-pago';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo') ?? '';
  const firma = req.nextUrl.searchParams.get('firma') ?? '';
  const url = `${N8N_CONFIRMAR_URL}?${new URLSearchParams({ codigo, firma })}`;

  try {
    // Render puede tardar en despertar: damos margen.
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(60000) });
    const html = await res.text();
    return new Response(html, {
      status: res.status,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(
      '<html><body style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;padding:0 16px">' +
        '<h2 style="color:#7A2B1E">Balcón al Valle Grande</h2>' +
        '<p>No pudimos comunicarnos con el sistema de reservas. Esperá un minuto y volvé a tocar el botón del mail.</p></body></html>',
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
    );
  }
}
