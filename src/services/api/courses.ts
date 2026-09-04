import { buildQuery, request } from './client';
import type {
    Course,
    CreateCoursePayload,
    DataResponse,
    ListCoursesQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateCoursePayload,
} from '@/types/api';

const BASE = '/courses';

/** Kurs butun tashkilotga tegishli — barcha filiallar bir xil kurslardan foydalanadi. */
export function listCourses(query: ListCoursesQuery = {}) {
    return request<PaginatedResponse<Course>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function createCourse(payload: CreateCoursePayload) {
    const res = await request<DataResponse<Course>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateCourse(id: string, payload: UpdateCoursePayload) {
    const res = await request<DataResponse<Course>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteCourse(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
