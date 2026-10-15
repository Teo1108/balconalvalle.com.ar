import { NextRequest, NextResponse } from 'next/server';
import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID } from '@/lib/vapi-config';
import { getClientIp, mintVapiToken, SITE_ORIGIN } from '@/lib/vapi-server';
import { rateLimit } from '@/lib/rate-limit';

// El chat de texto pasa por acá (y no directo del navegador a Vapi) para poder
// limitar los mensajes por IP: nadie puede saltear el límite llamando a Vapi.
const LIMITS = [
  { max: 20, windowMs: 10 * 60 * 1000 }, // 20 mensajes cada 10 minutos por IP
  { max: 60, windowMs: 24 * 60 * 60 * 1000 }, // y 60 por día
];
const MIN_GAP_MS = 1500; // entre un mensaje y el siguiente
const MAX_INPUT_CHARS = 500;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(`chat:${ip}`, LIMITS, MIN_GAP_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { limited: true, retryAfterS: limit.retryAfterS },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterS), 'X-RateLimit-Store': limit.store } },
    );
  }

  let body: { input?: unknown; sessionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const input = typeof body.input === 'string' ? body.input.trim().slice(0, MAX_INPUT_CHARS) : '';
  if (!input) return NextResponse.json({ error: 'empty input' }, { status: 400, headers: { 'X-RateLimit-Store': limit.store } });
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined;

  const token = (await mintVapiToken()) ?? VAPI_PUBLIC_KEY;
  try {
    const res = await fetch('https://api.vapi.ai/chat/web', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Origin: SITE_ORIGIN },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        input,
        // Le avisa a Ellie que es chat escrito: no pide deletrear.
        assistantOverrides: { variableValues: { canal: 'chat' } },
        ...(sessionId ? { sessionId } : {}),
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) return NextResponse.json({ error: `vapi ${res.status}` }, { status: 502 });
    const data: { sessionId?: string; output?: { role: string; content?: unknown }[] } = await res.json();
    const replies = (data.output ?? [])
      .filter((m) => m.role === 'assistant' && typeof m.content === 'string' && (m.content as string).trim() !== '')
      .map((m) => m.content as string);
    return NextResponse.json({ sessionId: data.sessionId ?? sessionId ?? null, replies });
  } catch {
    return NextResponse.json({ error: 'vapi unreachable' }, { status: 502 });
  }
}
