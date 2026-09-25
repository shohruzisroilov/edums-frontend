import { request } from './client';
import type {
    Branch,
    BranchPayload,
    DataResponse,
    MessageResponse,
} from '@/types/api';

const BASE = '/branches';

/**
 * Markaz filiallari — faollari birinchi. Login yetarli: filial tanlash
 * guruh, o'quvchi va boshqa formalarda kerak.
 */
export async function listBranches() {
    const res = await request<DataResponse<Branch[]>>(BASE);
    return res.data;
}

export async function createBranch(payload: BranchPayload) {
    const res = await request<DataResponse<Branch>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateBranch(
    id: string,
    payload: Partial<BranchPayload>,
) {
    const res = await request<DataResponse<Branch>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Oxirgi filial va guruhi/o'quvchisi bor filial o'chirilmaydi — 409. */
export function deleteBranch(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
