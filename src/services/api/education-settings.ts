import { request } from './client';
import type {
    DataResponse,
    EducationSettings,
    EducationSettingsPayload,
} from '@/types/api';

const BASE = '/education-settings';

/** Markazning o'z sozlamalari — ota-onalarga SMS (settings.manage). */
export async function getEducationSettings() {
    const res = await request<DataResponse<EducationSettings>>(BASE);
    return res.data;
}

export async function updateEducationSettings(
    payload: EducationSettingsPayload,
) {
    const res = await request<DataResponse<EducationSettings>>(BASE, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}
