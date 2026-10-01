import { buildQuery, request } from './client';
import type {
    BillingOverview,
    BillingPeriod,
    DataResponse,
    PaginatedResponse,
    PaymentRequest,
    PaymentRequestStatus,
} from '@/types/api';

/* ── Markaz tomoni (/billing) ─────────────────────────────────────────── */

/** Obuna holati, tariflar, so'rovlar va tarix — bitta javobda. */
export async function getBillingOverview() {
    const res = await request<DataResponse<BillingOverview>>('/billing');
    return res.data;
}

/**
 * Kutilayotgan eski so'rov bo'lsa, backend uni bekor qilib yangisini ochadi.
 * `year` — bir yillik xarid, tarifning yillik chegirmasi bilan.
 */
export async function createPaymentRequest(
    tariff_id: string,
    period: BillingPeriod = 'month',
) {
    const res = await request<DataResponse<PaymentRequest>>(
        '/billing/requests',
        { method: 'POST', body: { tariff_id, period } },
    );
    return res.data;
}

export async function cancelPaymentRequest(id: string) {
    const res = await request<DataResponse<PaymentRequest>>(
        `/billing/requests/${id}`,
        { method: 'DELETE' },
    );
    return res.data;
}

/* ── Super admin (/payment-requests) ──────────────────────────────────── */

export function listPaymentRequests(query: {
    status?: PaymentRequestStatus;
    limit?: number;
    offset?: number;
}) {
    return request<PaginatedResponse<PaymentRequest>>(
        `/payment-requests${buildQuery({ ...query })}`,
    );
}

export async function approvePaymentRequest(id: string) {
    const res = await request<DataResponse<PaymentRequest>>(
        `/payment-requests/${id}/approve`,
        { method: 'PATCH' },
    );
    return res.data;
}

export async function rejectPaymentRequest(id: string, note?: string) {
    const res = await request<DataResponse<PaymentRequest>>(
        `/payment-requests/${id}/reject`,
        { method: 'PATCH', body: { note } },
    );
    return res.data;
}
