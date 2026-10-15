// Utilidades de servidor compartidas por /api/start-call (voz) y /api/chat (texto).
import type { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { VAPI_ASSISTANT_ID } from '@/lib/vapi-config';

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_ORG_ID = process.env.VAPI_ORG_ID;
export const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://balconalvalle.com.ar';

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// Token de Vapi de corta duración, limitado a este sitio y a Ellie.
export async function mintVapiToken(): Promise<string | null> {
  if (!VAPI_PRIVATE_KEY || !VAPI_ORG_ID) return null;

  const key = new TextEncoder().encode(VAPI_PRIVATE_KEY);
  return new SignJWT({
    orgId: VAPI_ORG_ID,
    token: {
      tag: 'public',
      restrictions: {
        enabled: true,
        allowedOrigins: [SITE_ORIGIN],
        allowedAssistantIds: [VAPI_ASSISTANT_ID],
        allowTransientAssistant: false,
      },
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(key);
}

// Límite simple por IP en memoria (ventana deslizante).
// En Vercel cada instancia lleva su propia cuenta: frena el abuso común
// (alguien mandando mensajes en ráfaga) sin depender de un servicio externo.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number, minGapMs = 0): { ok: boolean; retryAfterS: number } {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const last = list[list.length - 1];
  if (list.length >= max) {
    return { ok: false, retryAfterS: Math.ceil((windowMs - (now - list[0])) / 1000) };
  }
  if (minGapMs && last !== undefined && now - last < minGapMs) {
    return { ok: false, retryAfterS: Math.ceil((minGapMs - (now - last)) / 1000) };
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    // limpieza ocasional para que el mapa no crezca sin límite
    hits.forEach((v, k) => {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    });
  }
  return { ok: true, retryAfterS: 0 };
}
