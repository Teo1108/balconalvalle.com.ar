// IndexNow: avisa a Bing (y a Copilot/ChatGPT, que usan su índice) que el
// sitio cambió, para que lo vuelvan a rastrear sin esperar.
// La clave se publica en /public/<clave>.txt para que Bing verifique que somos dueños.

const HOST = 'balconalvalle.com.ar';
const BASE_URL = `https://${HOST}`;
export const INDEXNOW_KEY = 'd219efe42cf7c2357037a20db30a328e';

const URLS = ['/', '/ellie', '/calendario', '/privacidad', '/llms.txt'].map(
  (path) => `${BASE_URL}${path === '/' ? '' : path}`
);

export async function submitIndexNow(): Promise<void> {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: URLS,
      }),
    });
    console.log(`[IndexNow] ${URLS.length} URLs enviadas: HTTP ${res.status}`);
  } catch (err) {
    console.error('[IndexNow] Error al enviar URLs:', err);
  }
}
