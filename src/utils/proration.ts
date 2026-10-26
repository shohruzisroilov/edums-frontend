import type { Weekday } from '@/types/api';

export interface ProrationResult {
    /** Oy bo'yicha jami darslar soni */
    totalLessons: number;
    /** Qo'shilgan kundan boshlab oy oxirigacha qolgan darslar soni */
    remainingLessons: number;
    /** O'tib ketgan darslar soni */
    passedLessons: number;
    /** 1 ta darsning hisoblangan narxi */
    pricePerLesson: number;
    /** Qolgan darslar uchun tavsiya etilgan birinchi oy narxi */
    suggestedFirstMonthPrice: number;
    /** Oy o'rtasidan qo'shilyaptimi (o'tib ketgan darslar bormi)? */
    isMidMonth: boolean;
}

/**
 * Guruh dars kunlari va qo'shilgan sanasiga qarab shu oydagi
 * darslar soni va mutanosib to'lov summasini hisoblab beruvchi funksiya.
 */
export function calculateLessonProration(
    joinedAt: string,
    lessonDays: Weekday[] | undefined,
    monthlyPrice: number,
): ProrationResult | null {
    if (!joinedAt || !lessonDays || lessonDays.length === 0 || monthlyPrice <= 0) {
        return null;
    }

    const parts = joinedAt.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12
    const joinDay = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(joinDay)) return null;

    // Oyning jami kunlari soni
    const daysInMonth = new Date(year, month, 0).getDate();

    let totalLessons = 0;
    let remainingLessons = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        // JavaScript getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
        // ISO Weekday: 1 = Mon ... 7 = Sun
        const jsDay = date.getDay();
        const isoWeekday = (jsDay === 0 ? 7 : jsDay) as Weekday;

        if (lessonDays.includes(isoWeekday)) {
            totalLessons++;
            if (day >= joinDay) {
                remainingLessons++;
            }
        }
    }

    if (totalLessons === 0) return null;

    const pricePerLesson = Math.round(monthlyPrice / totalLessons);
    const suggestedFirstMonthPrice = Math.min(
        monthlyPrice,
        Math.round(remainingLessons * (monthlyPrice / totalLessons)),
    );
    const passedLessons = totalLessons - remainingLessons;
    const isMidMonth = passedLessons > 0 && remainingLessons > 0;

    return {
        totalLessons,
        remainingLessons,
        passedLessons,
        pricePerLesson,
        suggestedFirstMonthPrice,
        isMidMonth,
    };
}
