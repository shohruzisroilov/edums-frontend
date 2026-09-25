'use client';

import { useT, type Translate } from '@/i18n/provider';
import type { Group } from '@/types/api';

/** "Du, Chor, Ju" — hafta kunlari joriy tilda, qisqa shaklda. */
export function formatLessonDays(days: Group['lesson_days'], t: Translate) {
    return days.map((day) => t(`weekday.${day}`)).join(', ');
}

/** Guruh darslari bir qatorda: "Du, Chor, Ju · 14:00–15:30". */
export function LessonSchedule({
    group,
}: {
    group: Pick<Group, 'lesson_days' | 'lesson_start' | 'lesson_end'>;
}) {
    const t = useT();

    return (
        <span className='tabular-nums'>
            {formatLessonDays(group.lesson_days, t)} · {group.lesson_start}–
            {group.lesson_end}
        </span>
    );
}
