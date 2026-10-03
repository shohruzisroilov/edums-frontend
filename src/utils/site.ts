/**
 * Saytning ommaviy manzili — robots, sitemap va Open Graph uchun absolyut
 * URL'lar shundan quriladi. Lokal ishlashda ham to'g'ri: bu faqat matn,
 * unga so'rov yuborilmaydi.
 */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://edums.uz'
).replace(/\/+$/, '');

/** Qidiruv tizimi ko'radigan ochiq sahifalar. */
export const PUBLIC_PAGES = ['/', '/register', '/login'] as const;
