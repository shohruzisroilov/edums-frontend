import type { GroupAttendance } from '@/types/api';

/**
 * O'quvchi shu kuni guruhda bo'lganmi. Davomat faqat shunday kunga qo'yiladi:
 * oy o'rtasida kelgan yoki ketgan o'quvchini boshqa kunga belgilashni
 * backend rad etadi.
 */
export function wasInGroupOn(
    row: GroupAttendance['students'][number],
    date: string,
): boolean {
    return row.stays.some(
        (stay) =>
            stay.joined_at <= date && (!stay.left_at || stay.left_at >= date),
    );
}
