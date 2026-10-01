import type { QueryClient } from '@tanstack/react-query';

/**
 * O'quvchining qaysi guruhda o'qishi yoki qancha to'lagani o'zgarganda
 * eskiradigan so'rovlar: balans va qarz a'zolik davrlaridan hisoblanadi,
 * guruh sonlari, jadval, dashboard va oylik varaqasi ham shularga tayanadi.
 *
 * Qo'shish, chiqarish, chegirma, to'lov, arxivlash, guruhni tugatish va lidni
 * o'quvchiga aylantirish — hammasi shu bitta ro'yxatni yangilaydi, aks holda
 * boshqa sahifada eski balans ko'rinib qolardi.
 */
const STUDY_QUERY_KEYS = [
    'students',
    'student',
    'student-enrollments',
    'student-balance',
    'student-payments',
    'student-attendance',
    'groups',
    'group',
    'group-students',
    'group-attendance',
    'schedule',
    'debtors',
    'dashboard',
    'salary-sheet',
] as const;

export function invalidateStudyData(queryClient: QueryClient): void {
    for (const key of STUDY_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
    }
}
