import { buildQuery, request } from './client';
import type {
    CreateRoomPayload,
    DataResponse,
    MessageResponse,
    Room,
    UpdateRoomPayload,
} from '@/types/api';

const BASE = '/rooms';

/** Login yetarli. branch_id berilsa — faqat shu filial xonalari. */
export async function listRooms(query: { branch_id?: string } = {}) {
    const res = await request<DataResponse<Room[]>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
    return res.data;
}

export async function createRoom(payload: CreateRoomPayload) {
    const res = await request<DataResponse<Room>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateRoom(id: string, payload: UpdateRoomPayload) {
    const res = await request<DataResponse<Room>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Guruhlari bor xona o'chirilmaydi — 409. */
export function deleteRoom(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
