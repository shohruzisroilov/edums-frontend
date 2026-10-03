import { SITE_URL } from '@/utils/site';
import type { MetadataRoute } from 'next';

/**
 * Boshqaruv paneli login ortida — qidiruv robotiga u bo'sh yuklanish ekrani
 * bo'lib ko'rinadi, shuning uchun indekslanmaydi. Statik fayllar (`/_next`,
 * `/landing`) ochiq qoladi: ularsiz landing sahifa to'g'ri chizilmaydi.
 */
const PRIVATE_SECTIONS = [
    '/audit',
    '/billing',
    '/branches',
    '/cashbox',
    '/courses',
    '/dashboard',
    '/debtors',
    '/educations',
    '/expenses',
    '/forgot-password',
    '/groups',
    '/leads',
    '/overview',
    '/payments',
    '/platform-settings',
    '/profile',
    '/roles',
    '/salaries',
    '/schedule',
    '/settings',
    '/sms-settings',
    '/students',
    '/tariffs',
    '/users',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/', disallow: PRIVATE_SECTIONS },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
