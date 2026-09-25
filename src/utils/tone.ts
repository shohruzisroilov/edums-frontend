/**
 * Jadvaldagi muhim summalar rangi — badge tokenlaridan, shuning uchun ikkala
 * mavzuda ham o'qiladi. Faqat rangga tayanmang: summaning ishorasi yoki
 * yonidagi ustun ma'noni o'zi ham aytishi kerak.
 */
export const TONE_TEXT = {
    error: 'text-badge-error-text',
    warning: 'text-badge-warning-text',
    success: 'text-badge-success-text',
} as const;

/** Balans: minus — qarz (qizil), plus — oldindan to'langan (yashil). */
export function balanceTone(balance: number): string | undefined {
    if (balance < 0) return TONE_TEXT.error;
    if (balance > 0) return TONE_TEXT.success;
    return undefined;
}
