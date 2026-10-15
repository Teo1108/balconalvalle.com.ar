// Límite de pedidos por IP para /api/chat y /api/start-call.
//
// La cuenta vive en Upstash Redis (conectado desde Vercel → Storage), así todas
// las copias del sitio comparten el mismo contador y las claves se borran solas
// (TTL). Si Redis no está configurado o no responde, se usa un contador en
// memoria: el sitio nunca deja de atender por culpa del límite.

export type Window = { max: number; windowMs: number };
export type LimitResult = { ok: boolean; retryAfterS: number; store: 'redis' | 'memory' };

const REDIS_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.STORAGE_REST_API_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.STORAGE_REST_API_TOKEN;

export async function rateLimit(key: string, windows: Window[], minGapMs = 0): Promise<LimitResult> {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      return await redisLimit(key, windows, minGapMs);
    } catch {
      // Redis caído o lento: seguimos con la cuenta en memoria
    }
  }
  return memoryLimit(key, windows, minGapMs);
}

// Ventanas fijas: un contador por ventana (INCR + EXPIRE) y una marca con
// vencimiento corto para la separación mínima entre mensajes. Todo en un solo
// viaje a Redis.
async function redisLimit(key: string, windows: Window[], minGapMs: number): Promise<LimitResult> {
  const now = Date.now();
  const cmds: (string | number)[][] = [];
  const counterKeys = windows.map((w) => `rl:${key}:${w.windowMs}:${Math.floor(now / w.windowMs)}`);
  counterKeys.forEach((k, i) => {
    cmds.push(['INCR', k], ['PEXPIRE', k, windows[i].windowMs]);
  });
  if (minGapMs) cmds.push(['SET', `rl:${key}:gap`, '1', 'PX', minGapMs, 'NX']);

  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    signal: AbortSignal.timeout(1500),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const out: { result?: unknown; error?: string }[] = await res.json();
  if (out.some((r) => r.error)) throw new Error('redis command error');

  for (let i = 0; i < windows.length; i++) {
    const count = Number(out[i * 2].result);
    if (count > windows[i].max) {
      const { windowMs } = windows[i];
      return { ok: false, retryAfterS: Math.ceil((windowMs - (now % windowMs)) / 1000), store: 'redis' };
    }
  }
  if (minGapMs && out[out.length - 1].result !== 'OK') {
    return { ok: false, retryAfterS: Math.ceil(minGapMs / 1000), store: 'redis' };
  }
  return { ok: true, retryAfterS: 0, store: 'redis' };
}

// Respaldo en memoria (ventana deslizante). Cada copia del sitio lleva su propia cuenta.
const hits = new Map<string, number[]>();

function memoryLimit(key: string, windows: Window[], minGapMs: number): LimitResult {
  const now = Date.now();
  const longest = Math.max(...windows.map((w) => w.windowMs));
  const list = (hits.get(key) ?? []).filter((t) => now - t < longest);
  for (const w of windows) {
    const inWindow = list.filter((t) => now - t < w.windowMs);
    if (inWindow.length >= w.max) {
      return { ok: false, retryAfterS: Math.ceil((w.windowMs - (now - inWindow[0])) / 1000), store: 'memory' };
    }
  }
  const last = list[list.length - 1];
  if (minGapMs && last !== undefined && now - last < minGapMs) {
    return { ok: false, retryAfterS: Math.ceil((minGapMs - (now - last)) / 1000), store: 'memory' };
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    // limpieza ocasional para que el mapa no crezca sin límite
    hits.forEach((v, k) => {
      if (!v.some((t) => now - t < longest)) hits.delete(k);
    });
  }
  return { ok: true, retryAfterS: 0, store: 'memory' };
}
