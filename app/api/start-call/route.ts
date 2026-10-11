import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID } from '@/lib/vapi-config';

const N8N_CALL_GATE_URL = process.env.N8N_CALL_GATE_URL;
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_ORG_ID = process.env.VAPI_ORG_ID;
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://balconalvalle.com.ar';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

async function isAllowedByGate(ip: string): Promise<boolean> {
  if (!N8N_CALL_GATE_URL) return true; // gate not configured — fail open

  try {
    const res = await fetch(N8N_CALL_GATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return true; // fail open on gate hiccup
    const data = await res.json();
    return data.allowed !== false;
  } catch {
    // n8n/Airtable unreachable — fail open. Blocking every call because the
    // rate-limit backend is down would hurt real bookings more than a rare
    // abuse window costs in Vapi credit.
    return true;
  }
}

async function mintVapiToken(): Promise<string | null> {
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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await isAllowedByGate(ip);

  if (!allowed) {
    return NextResponse.json({ allowed: false });
  }

  // Falls back to the static public key until VAPI_PRIVATE_KEY/VAPI_ORG_ID
  // are configured, so call-start keeps working during the migration.
  const token = (await mintVapiToken()) ?? VAPI_PUBLIC_KEY;
  return NextResponse.json({ allowed: true, token });
}
