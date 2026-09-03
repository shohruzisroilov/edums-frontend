import { buildQuery, request } from './client';
import type {
    CreateStudentPayload,
    DataResponse,
    ListStudentsQuery,
    MessageResponse,
    PaginatedResponse,
    Student,
    UpdateStudentPayload,
} from '@/types/api';

const BASE = '/students';

export function listStudents(query: ListStudentsQuery = {}) {
    return request<PaginatedResponse<Student>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function createStudent(payload: CreateStudentPayload) {
    const res = await request<DataResponse<Student>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateStudent(id: string, payload: UpdateStudentPayload) {
    const res = await request<DataResponse<Student>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteStudent(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
