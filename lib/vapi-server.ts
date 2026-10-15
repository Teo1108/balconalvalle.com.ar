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
