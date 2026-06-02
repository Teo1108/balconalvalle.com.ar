export const SITE_CONFIG = {
  name: 'Balcon al Valle Grande',
  whatsapp: {
    number: '5491120309393',
    message: 'Hola, quiero consultar disponibilidad en Balcon al Valle Grande',
  },
  social: {
    instagram: 'https://www.instagram.com/balconalvallegrande/',
    facebook: 'https://www.facebook.com/balconalvalle',
  },
} as const;

export function whatsappUrl(customMessage?: string): string {
  const msg = customMessage ?? SITE_CONFIG.whatsapp.message;
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(msg)}`;
}
