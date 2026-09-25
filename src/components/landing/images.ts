export type LandingImage = 'hero' | 'finance' | 'learning' | 'leads' | 'team';

/**
 * Landing sahifadagi rasmlar. Rasmni `public/landing/` papkasiga qo'ying va
 * yo'lini shu yerga yozing, masalan: `hero: '/landing/dashboard.png'`.
 * `null` turgan joyda sahifada rasm uchun ramka ko'rinadi.
 *
 * Tavsiya: interfeys skrinshotlari, 16:10 nisbatda (masalan 1600×1000),
 * PNG yoki WebP. Ramka brauzer oynasiga o'xshaydi — skrinshotni brauzerning
 * manzil satrisiz, faqat sahifa qismini olib qo'ying.
 */
export const LANDING_IMAGES: Record<LandingImage, string | null> = {
    /** Hero ostidagi katta rasm — dashboard. */
    hero: null,
    /** Moliya bo'limi — kassa yoki qarzdorlar sahifasi. */
    finance: null,
    /** O'quv jarayoni — guruh sahifasi (davomat) yoki dars jadvali. */
    learning: null,
    /** Lidlar sahifasi. */
    leads: null,
    /** Jamoa — oyliklar yoki rollar sahifasi. */
    team: null,
};
