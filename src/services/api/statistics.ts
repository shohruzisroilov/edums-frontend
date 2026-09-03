import { request } from './client';
import type { DataResponse, SystemStatistics } from '@/types/api';

/** GET /api/statistics — faqat super admin. */
export async function getSystemStatistics() {
    const res = await request<DataResponse<SystemStatistics>>('/statistics');
    return res.data;
}
