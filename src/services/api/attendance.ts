import { buildQuery, request } from './client';
import type {
    DataResponse,
    GroupAttendance,
    MarkAttendancePayload,
    MessageResponse,
    StudentAttendance,
} from '@/types/api';

/** Oy jurnali: dars kunlari va shu oyda guruhda bo'lganlar. */
export async function getGroupAttendance(group_id: string, month?: string) {
    const res = await request<DataResponse<GroupAttendance>>(
        `/groups/${group_id}/attendance${buildQuery({ month })}`,
    );
    return res.data;
}

/** Bir kunni belgilash; qayta yuborilsa ustidan yoziladi. */
export function markAttendance(
    group_id: string,
    payload: MarkAttendancePayload,
) {
    return request<MessageResponse>(`/groups/${group_id}/attendance`, {
        method: 'PUT',
        body: payload,
    });
}

export async function getStudentAttendance(student_id: string, month?: string) {
    const res = await request<DataResponse<StudentAttendance>>(
        `/students/${student_id}/attendance${buildQuery({ month })}`,
    );
    return res.data;
}
