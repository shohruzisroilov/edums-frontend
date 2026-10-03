import type { Group, Weekday } from '@/types/api';
import { toISODate } from '@/utils/format';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` — mahalliy kalendar kuni (vaqt zonasi siljimasligi uchun). */
function toDate(iso: string): Date {
    const [, year, month, day] = ISO_DATE.exec(iso) ?? [];
    return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isISODate(value: string): boolean {
    return ISO_DATE.test(value) && toISODate(toDate(value)) === value;
}

export function addDays(iso: string, days: number): string {
    const date = toDate(iso);
    date.setDate(date.getDate() + days);
    return toISODate(date);
}

/** Oy qo'shiladi, kun iloji boricha saqlanadi (31-yanvar + 1 oy → 28-fevral). */
export function addMonths(iso: string, months: number): string {
    const date = toDate(iso);
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    date.setDate(Math.min(day, last.getDate()));
    return toISODate(date);
}

/** ISO hafta kuni: 1 — dushanba … 7 — yakshanba. */
export function weekdayOf(iso: string): Weekday {
    const day = toDate(iso).getDay();
    return (day === 0 ? 7 : day) as Weekday;
}

/** `YYYY-MM` */
export function monthOf(iso: string): string {
    return iso.slice(0, 7);
}

/**
 * Oy to'ri: oyning birinchi kuni tushgan haftaning dushanbasidan boshlab
 * olti hafta — har oy bir xil balandlikda turadi.
 */
export function monthGridDates(iso: string): string[] {
    const first = `${monthOf(iso)}-01`;
    const monday = addDays(first, 1 - weekdayOf(first));
    return Array.from({ length: 42 }, (_, i) => addDays(monday, i));
}

/** `HH:MM` → kun boshidan daqiqalar. */
export function minutesOf(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
}

/**
 * Shu sanada darsi bo'lgan guruhlar, erta boshlanadigani birinchi: hafta
 * kuni mos, sana esa guruhning boshlanish va tugash kunlari oralig'ida.
 */
export function lessonsOn(groups: Group[], iso: string): Group[] {
    const weekday = weekdayOf(iso);
    return groups
        .filter(
            (group) =>
                group.lesson_days.includes(weekday) &&
                iso >= group.start_date &&
                (!group.end_date || iso <= group.end_date),
        )
        .sort(
            (a, b) =>
                minutesOf(a.lesson_start) - minutesOf(b.lesson_start) ||
                a.name.localeCompare(b.name),
        );
}

/** Oy to'ridagi har bir kun uchun darslar soni. */
export function lessonCounts(
    groups: Group[],
    dates: string[],
): Map<string, number> {
    return new Map(dates.map((date) => [date, lessonsOn(groups, date).length]));
}
