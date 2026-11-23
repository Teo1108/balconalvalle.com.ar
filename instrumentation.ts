// Se ejecuta una vez cuando arranca el servidor (cada despliegue en Render).
// Espera unos minutos a que la versión nueva esté sirviendo tráfico y
// después avisa a Bing por IndexNow.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.RENDER) return; // solo en el servidor de producción, no en builds locales

  const { submitIndexNow } = await import('./lib/indexnow');
  setTimeout(() => {
    void submitIndexNow();
  }, 3 * 60 * 1000);
}
