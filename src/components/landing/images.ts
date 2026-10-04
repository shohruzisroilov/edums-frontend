export type LandingImage = 'hero' | 'finance' | 'learning' | 'leads' | 'team';

/**
 * Landing sahifadagi rasmlar. Rasmni `public/landing/` papkasiga qo'ying va
 * yo'lini shu yerga yozing, masalan: `hero: '/landing/dashboard.png'`.
 * `null` turgan joyda sahifada rasm uchun ramka ko'rinadi.
 *
 * Faqat ilovaning haqiqiy skrinshotlari (namunaviy ma'lumot bilan) — chizilgan
 * yoki AI yaratgan "interfeys" tizimda yo'q narsani va'da qilib qo'yadi.
 * Ramka 16:9 (1600×900), WebP. Skrinshot brauzerning manzil satrisiz,
 * faqat sahifa qismi. `hero` — Open Graph rasmi (1200×630, PNG).
 */
export const LANDING_IMAGES: Record<LandingImage, string | null> = {
    /** Ijtimoiy tarmoqlardagi ko'rinish (Open Graph) — dashboard. */
    hero: '/landing/hero.png',
    /** Moliya bo'limi — kassa. */
    finance: '/landing/finance.webp',
    /** O'quv jarayoni — dars jadvali. */
    learning: '/landing/learning.webp',
    /** Lidlar sahifasi. */
    leads: '/landing/leads.webp',
    /** Jamoa — oyliklar. */
    team: '/landing/team.webp',
};
