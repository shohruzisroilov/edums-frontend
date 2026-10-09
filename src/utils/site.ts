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

/**
 * Rasmiy aloqa va qo'llab-quvvatlash kanallari.
 */
export const SUPPORT_CONTACTS = {
    phone: '+998940080473',
    phoneFormatted: '+998 94 008 04 73',
    phoneTel: 'tel:+998940080473',
    telegramPersonal: '@Shohruz_Isroilov',
    telegramPersonalUsername: 'Shohruz_Isroilov',
    telegramPersonalUrl: 'https://t.me/Shohruz_Isroilov',
    telegramGroup: '@edumsuz',
    telegramGroupUsername: 'edumsuz',
    telegramGroupUrl: 'https://t.me/edumsuz',
} as const;
