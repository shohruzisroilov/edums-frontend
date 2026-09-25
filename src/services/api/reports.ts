import { request } from './client';
import type { DataResponse, Dashboard, PlatformStats } from '@/types/api';

/** Markaz dashboardi (reports.view). */
export async function getDashboard() {
    const res = await request<DataResponse<Dashboard>>('/dashboard');
    return res.data;
}

/** Platforma ko'rsatkichlari (super admin). */
export async function getPlatformStats() {
    const res = await request<DataResponse<PlatformStats>>('/platform-stats');
    return res.data;
}
