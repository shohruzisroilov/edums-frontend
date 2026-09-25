import { buildQuery, request } from './client';
import type {
    CreateStudentPaymentPayload,
    DataResponse,
    DebtorsResponse,
    ListDebtorsQuery,
    ListStudentPaymentsQuery,
    MessageResponse,
    StudentBalance,
    StudentPayment,
    StudentPaymentsResponse,
} from '@/types/api';

/**
 * O'quvchilar markazga to'laydigan pul. Markazning platformaga to'lovi —
 * `billing.ts` (payment_requests), bu bilan adashtirmang.
 */

/** Yangisi birinchi; `sum` — barcha mos to'lovlar yig'indisi. */
export function listStudentPayments(query: ListStudentPaymentsQuery = {}) {
    return request<StudentPaymentsResponse>(
        `/payments${buildQuery({ ...query })}`,
    );
}

/** Faqat o'quvchi o'qigan yoki o'qiyotgan guruh uchun — aks holda 400. */
export async function createStudentPayment(
    payload: CreateStudentPaymentPayload,
) {
    const res = await request<DataResponse<StudentPayment>>('/payments', {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export function deleteStudentPayment(id: string) {
    return request<MessageResponse>(`/payments/${id}`, { method: 'DELETE' });
}

/** Ko'p qarz birinchi; `total_debt` — barcha mos qarzlar yig'indisi. */
export function listDebtors(query: ListDebtorsQuery = {}) {
    return request<DebtorsResponse>(`/debtors${buildQuery({ ...query })}`);
}

/** Har bir guruh bo'yicha hisoblangan, to'langan va balans. */
export async function getStudentBalance(student_id: string) {
    const res = await request<DataResponse<StudentBalance>>(
        `/students/${student_id}/balance`,
    );
    return res.data;
}
