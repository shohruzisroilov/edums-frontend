import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Docker image'i (Dockerfile) o'zi yetarli serverni oladi. Lokal
    // `npm run build && npm start` bunga muhtoj emas.
    output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
};

export default nextConfig;
