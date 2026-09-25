import { buildQuery, request } from './client';
import type {
    CreateExpensePayload,
    DataResponse,
    Expense,
    ExpensesResponse,
    ListExpensesQuery,
    MessageResponse,
} from '@/types/api';

const BASE = '/expenses';

/** Yangisi birinchi; `sum` — barcha mos xarajatlar yig'indisi. */
export function listExpenses(query: ListExpensesQuery = {}) {
    return request<ExpensesResponse>(`${BASE}${buildQuery({ ...query })}`);
}

/** "salary" toifasi emas — u oylik to'lovi bilan yoziladi. */
export async function createExpense(payload: CreateExpensePayload) {
    const res = await request<DataResponse<Expense>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

/** Oylik to'lovining xarajati o'chirilmaydi — 400. */
export function deleteExpense(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
