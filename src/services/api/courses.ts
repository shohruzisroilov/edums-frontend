import { request } from './client';
import type {
    Course,
    CoursePayload,
    DataResponse,
    MessageResponse,
} from '@/types/api';

const BASE = '/courses';

/** Faollari birinchi. Login yetarli — kurs tanlash boshqa formalarda ham kerak. */
export async function listCourses() {
    const res = await request<DataResponse<Course[]>>(BASE);
    return res.data;
}

export async function createCourse(payload: CoursePayload) {
    const res = await request<DataResponse<Course>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateCourse(
    id: string,
    payload: Partial<CoursePayload>,
) {
    const res = await request<DataResponse<Course>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Guruhlari bor kurs o'chirilmaydi — 409. */
export function deleteCourse(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
