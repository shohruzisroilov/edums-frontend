import { buildQuery, request } from './client';
import type {
    ConvertLeadPayload,
    DataResponse,
    Lead,
    LeadPayload,
    LeadStats,
    ListLeadsQuery,
    MessageResponse,
    PaginatedResponse,
} from '@/types/api';

const BASE = '/leads';

export function listLeads(query: ListLeadsQuery = {}) {
    return request<PaginatedResponse<Lead>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

/** Voronka: har bir holatdagi lidlar soni. */
export async function getLeadStats() {
    const res = await request<DataResponse<LeadStats>>(`${BASE}/stats`);
    return res.data;
}

export async function createLead(payload: LeadPayload) {
    const res = await request<DataResponse<Lead>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateLead(id: string, payload: Partial<LeadPayload>) {
    const res = await request<DataResponse<Lead>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** O'quvchi ochiladi (va guruhga qo'shiladi), lid — won. Bitta tranzaksiya. */
export async function convertLead(id: string, payload: ConvertLeadPayload) {
    const res = await request<DataResponse<Lead>>(`${BASE}/${id}/convert`, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export function deleteLead(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
