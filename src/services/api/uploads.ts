import { request } from './client';
import type { DataResponse, UploadResult } from '@/types/api';

const BASE = '/uploads';

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
