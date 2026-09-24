import { request } from './client';
import type { DataResponse, PermissionGroup } from '@/types/api';

/** GET /permissions — ruxsatlar katalogi, modul bo'yicha guruhlangan. */
export async function listPermissions() {
    const res = await request<DataResponse<PermissionGroup[]>>('/permissions');
    return res.data;
}
