import { buildQuery, request } from './client';
import type {
    DataResponse,
    Enrollment,
    EnrollPayload,
    ListStudentsQuery,
    MessageResponse,
    PaginatedResponse,
    Student,
    StudentPayload,
    UpdateEnrollmentPayload,
} from '@/types/api';

const BASE = '/students';

export function listStudents(query: ListStudentsQuery = {}) {
    return request<PaginatedResponse<Student>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function getStudent(id: string) {
    const res = await request<DataResponse<Student>>(`${BASE}/${id}`);
    return res.data;
}

/** O'quvchi yoki ota-ona telefonidan kamida bittasi shart — aks holda 400. */
export async function createStudent(payload: StudentPayload) {
    const res = await request<DataResponse<Student>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateStudent(
    id: string,
    payload: Partial<StudentPayload>,
) {
    const res = await request<DataResponse<Student>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Tarixi bor o'quvchi o'chirilmaydi — 409, uni arxivlash kerak. */
export function deleteStudent(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}

/* ── Guruhlardagi davrlar ─────────────────────────────────────────────── */

/** O'quvchining barcha davrlari, yangisi birinchi. */
export async function listStudentEnrollments(student_id: string) {
    const res = await request<DataResponse<Enrollment[]>>(
        `${BASE}/${student_id}/enrollments`,
    );
    return res.data;
}

/** Guruh o'quvchilari; `include_left` — chiqib ketganlar ham. */
export async function listGroupStudents(
    group_id: string,
    include_left = false,
) {
    const res = await request<DataResponse<Enrollment[]>>(
        `/groups/${group_id}/students${buildQuery({ include_left: include_left || undefined })}`,
    );
    return res.data;
}

/** Faqat faol guruhga; bir guruhda ikkinchi ochiq davr — 409. */
export async function enrollStudent(group_id: string, payload: EnrollPayload) {
    const res = await request<DataResponse<Enrollment>>(
        `/groups/${group_id}/students`,
        { method: 'POST', body: payload },
    );
    return res.data;
}

/** `left_at` — guruhdan chiqdi; `monthly_price` — chegirma. */
export async function updateEnrollment(
    id: string,
    payload: UpdateEnrollmentPayload,
) {
    const res = await request<DataResponse<Enrollment>>(`/enrollments/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}
