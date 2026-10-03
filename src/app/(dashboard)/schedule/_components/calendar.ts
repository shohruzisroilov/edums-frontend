import type { Group, Weekday } from '@/types/api';
import { toISODate } from '@/utils/format';

export type CalendarView = 'day' | 'week' | 'month' | 'list';

export const CALENDAR_VIEWS: CalendarView[] = ['day', 'week', 'month', 'list'];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` — mahalliy kalendar kuni (vaqt zonasi siljimasligi uchun). */
function toDate(iso: string): Date {
    const [, year, month, day] = ISO_DATE.exec(iso) ?? [];
    return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isISODate(value: string): boolean {
    const match = ISO_DATE.exec(value);
    if (!match) return false;
    const date = toDate(value);
    return toISODate(date) === value;
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

/** Sana tushgan haftaning dushanbasi. */
export function startOfWeek(iso: string): string {
    return addDays(iso, 1 - weekdayOf(iso));
}

/** Dushanbadan yakshanbagacha yetti kun. */
export function weekDates(iso: string): string[] {
    const monday = startOfWeek(iso);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
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
    const monday = startOfWeek(`${monthOf(iso)}-01`);
    return Array.from({ length: 42 }, (_, i) => addDays(monday, i));
}

/** Ko'rinishga qarab oldingi/keyingi davr. */
export function shiftDate(
    view: CalendarView,
    iso: string,
    direction: 1 | -1,
): string {
    if (view === 'day') return addDays(iso, direction);
    if (view === 'month') return addMonths(iso, direction);
    return addDays(iso, 7 * direction);
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

/** Bir nechta sana uchun darslar — har bir ko'rinish bir marta hisoblaydi. */
export function lessonsByDate(
    groups: Group[],
    dates: string[],
): Map<string, Group[]> {
    return new Map(dates.map((date) => [date, lessonsOn(groups, date)]));
}

export interface PlacedLesson {
    group: Group;
    start: number;
    end: number;
    /** Ustma-ust tushgan darslar ichida nechanchi ustun (0 dan). */
    column: number;
    /** Shu to'qnashuvdagi ustunlar soni — blok kengligi 1/columns. */
    columns: number;
}

/**
 * Bir kunning darslarini vaqt to'rida joylashtiradi. Vaqti kesishgan darslar
 * yonma-yon ustunlarga bo'linadi (Google Calendar kabi), kesishmaydiganlari
 * to'liq kenglikda qoladi.
 */
export function layoutDay(groups: Group[]): PlacedLesson[] {
    const items = groups
        .map((group) => ({
            group,
            start: minutesOf(group.lesson_start),
            end: minutesOf(group.lesson_end),
        }))
        .sort((a, b) => a.start - b.start || b.end - a.end);

    const placed: PlacedLesson[] = [];
    let cluster: PlacedLesson[] = [];
    let clusterEnd = -1;

    const closeCluster = () => {
        const columns = Math.max(...cluster.map((item) => item.column)) + 1;
        for (const item of cluster) item.columns = columns;
        cluster = [];
        clusterEnd = -1;
    };

    for (const item of items) {
        if (cluster.length && item.start >= clusterEnd) closeCluster();

        const taken = new Set(
            cluster
                .filter((other) => other.end > item.start)
                .map((other) => other.column),
        );
        let column = 0;
        while (taken.has(column)) column += 1;

        const lesson = { ...item, column, columns: 1 };
        cluster.push(lesson);
        placed.push(lesson);
        clusterEnd = Math.max(clusterEnd, item.end);
    }
    if (cluster.length) closeCluster();

    return placed;
}

/**
 * To'r soatlari: odatda 08:00–21:00, undan oldin yoki keyin dars bo'lsa
 * kengayadi — aks holda u to'rdan tashqarida qolardi.
 */
export function hourBounds(groups: Group[]): { from: number; to: number } {
    let from = 8;
    let to = 21;
    for (const group of groups) {
        from = Math.min(from, Math.floor(minutesOf(group.lesson_start) / 60));
        to = Math.max(to, Math.ceil(minutesOf(group.lesson_end) / 60));
    }
    return { from, to: Math.min(to, 24) };
}
