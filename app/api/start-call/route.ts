import { NextRequest, NextResponse } from 'next/server';
import { VAPI_PUBLIC_KEY } from '@/lib/vapi-config';
import { getClientIp, mintVapiToken, rateLimit } from '@/lib/vapi-server';

const N8N_CALL_GATE_URL = process.env.N8N_CALL_GATE_URL;
const MAX_CALLS = 5; // llamadas de voz por IP
const WINDOW_MS = 10 * 60 * 1000; // en 10 minutos

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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`call:${ip}`, MAX_CALLS, WINDOW_MS).ok) {
    return NextResponse.json({ allowed: false });
  }
  const allowed = await isAllowedByGate(ip);

  if (!allowed) {
    return NextResponse.json({ allowed: false });
  }

  // Falls back to the static public key until VAPI_PRIVATE_KEY/VAPI_ORG_ID
  // are configured, so call-start keeps working during the migration.
  const token = (await mintVapiToken()) ?? VAPI_PUBLIC_KEY;
  return NextResponse.json({ allowed: true, token });
}
