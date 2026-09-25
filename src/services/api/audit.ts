import { buildQuery, request } from './client';
import type {
    AuditLog,
    ListAuditLogsQuery,
    PaginatedResponse,
} from '@/types/api';

/** Markazdagi amallar — yangisi birinchi. Yozuvlar 1 yil saqlanadi. */
export function listAuditLogs(query: ListAuditLogsQuery = {}) {
    return request<PaginatedResponse<AuditLog>>(
        `/audit-logs${buildQuery({ ...query })}`,
    );
}
