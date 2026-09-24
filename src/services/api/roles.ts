import { buildQuery, request } from './client';
import type {
    CreateRolePayload,
    DataResponse,
    MessageResponse,
    Role,
    UpdateRolePayload,
} from '@/types/api';

const BASE = '/roles';

/** Rollar kam bo'ladi, shuning uchun sahifalanmaydi. Owner birinchi keladi. */
export async function listRoles(query: { search?: string } = {}) {
    const res = await request<DataResponse<Role[]>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
    return res.data;
}

export async function createRole(payload: CreateRolePayload) {
    const res = await request<DataResponse<Role>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateRole(id: string, payload: UpdateRolePayload) {
    const res = await request<DataResponse<Role>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Foydalanuvchilarga biriktirilgan rol o'chirilmaydi — 409. */
export function deleteRole(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
