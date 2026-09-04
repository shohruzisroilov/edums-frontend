import { buildQuery, request } from './client';
import type {
    ListStaffQuery,
    MessageResponse,
    PaginatedResponse,
    User,
} from '@/types/api';

const BASE = '/staff';

/**
 * Tashkilot ichidagi xodim hisoblari. Owner barcha xodimlarni ko'radi,
 * manager esa faqat o'zi yuritadigan filiallardagilarni.
 */
export function listStaff(query: ListStaffQuery = {}) {
    return request<PaginatedResponse<User>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export function deleteStaff(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}

/** Eski parolni ko'rish mumkin emas — faqat yangisini o'rnatish. */
export function resetStaffPassword(id: string, password: string) {
    return request<MessageResponse>(`${BASE}/${id}/password`, {
        method: 'PATCH',
        body: { password },
    });
}
