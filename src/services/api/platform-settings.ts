import { request } from './client';
import type {
    DataResponse,
    PlatformSettings,
    PlatformSettingsPayload,
    PublicPlatformSettings,
} from '@/types/api';

const BASE = '/platform-settings';

/** Landing va ro'yxatdan o'tish sahifasi uchun — login talab qilinmaydi. */
export async function getPublicPlatformSettings() {
    const res = await request<DataResponse<PublicPlatformSettings>>(
        `${BASE}/public`,
        { skipAuth: true },
    );
    return res.data;
}

/** Super admin: sinov muddati va to'lov ko'rsatmasi. */
export async function getPlatformSettings() {
    const res = await request<DataResponse<PlatformSettings>>(BASE);
    return res.data;
}

export async function updatePlatformSettings(payload: PlatformSettingsPayload) {
    const res = await request<DataResponse<PlatformSettings>>(BASE, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}
