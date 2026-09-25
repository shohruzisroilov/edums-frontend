import { buildQuery, request } from './client';
import type {
    CreateUserPayload,
    DataResponse,
    ListUsersQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateUserPayload,
    User,
    UserOption,
} from '@/types/api';

const BASE = '/users';

/** Faqat joriy foydalanuvchining markazidagilar — backend o'zi cheklaydi. */
export function listUsers(query: ListUsersQuery = {}) {
    return request<PaginatedResponse<User>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

/** Faol foydalanuvchilar, faqat ism — o'qituvchi tanlash uchun. Login yetarli. */
export async function listUserOptions() {
    const res = await request<DataResponse<UserOption[]>>(`${BASE}/options`);
    return res.data;
}

export async function createUser(payload: CreateUserPayload) {
    const res = await request<DataResponse<User>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Eski parolni ko'rish mumkin emas — faqat yangisini o'rnatish. */
export async function resetUserPassword(id: string, password: string) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}/password`, {
        method: 'PATCH',
        body: { password },
    });
    return res.data;
}

export function deleteUser(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
