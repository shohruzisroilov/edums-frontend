import { PUBLIC_PAGES, SITE_URL } from '@/utils/site';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return PUBLIC_PAGES.map((page) => ({
        url: `${SITE_URL}${page === '/' ? '' : page}`,
        changeFrequency: page === '/' ? 'weekly' : 'yearly',
        priority: page === '/' ? 1 : 0.5,
    }));
}
