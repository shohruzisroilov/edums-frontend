'use client';

import { useSession } from '@/hooks/use-session';
import { getLeadStats } from '@/services/api/leads';
import { can } from '@/utils/access';
import { useQuery } from '@tanstack/react-query';

/**
 * Yangi kelgan (status: 'new') lidlar soni.
 * Sidebarda va navigatsiyada bildirishnoma nishoni (badge) uchun ishlatiladi.
 */
export function useNewLeadsCount(): number {
    const { session } = useSession();
    const canView = can(session, 'leads.view');

    const query = useQuery({
        queryKey: ['leads', 'stats'],
        queryFn: getLeadStats,
        enabled: canView,
        staleTime: 30_000,
        refetchInterval: 60_000,
    });

    return query.data?.new ?? 0;
}
