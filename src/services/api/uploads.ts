import { buildQuery, request } from './client';
import type {
    DataResponse,
    ListUploadsQuery,
    MessageResponse,
    PaginatedResponse,
    Upload,
    UploadResult,
} from '@/types/api';

const BASE = '/uploads';

export function listUploads(query: ListUploadsQuery = {}) {
    return request<PaginatedResponse<Upload>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

/**
 * Fayl mazmuni sha256 bilan hashlanadi: ayni shu mazmun allaqachon bo'lsa
 * yangi nusxa yaratilmaydi va mavjud yozuv `is_duplicate: true` bilan qaytadi.
 */
export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await request<DataResponse<UploadResult>>(BASE, {
        method: 'POST',
        formData,
    });
    return res.data;
}

/** Maksimum 10 ta fayl. */
export async function uploadFiles(files: File[]) {
    const formData = new FormData();
    for (const file of files) formData.append('files', file);

    const res = await request<DataResponse<UploadResult[]>>(`${BASE}/many`, {
        method: 'POST',
        formData,
    });
    return res.data;
}

export function deleteUpload(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
