/**
 * Har bir guruhning o'z rangi — jadvalda bir guruh doim bir xil rangda
 * turadi. Rang guruh id'sidan hisoblanadi, shuning uchun saqlanmaydi.
 */
const COLOR_PALETTES = [
    {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40',
        border: 'border-indigo-200 dark:border-indigo-800/60',
        text: 'text-indigo-900 dark:text-indigo-200',
        subtext: 'text-indigo-600 dark:text-indigo-400',
        accent: 'bg-indigo-500',
    },
    {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        text: 'text-emerald-900 dark:text-emerald-200',
        subtext: 'text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
    },
    {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/60',
        text: 'text-amber-900 dark:text-amber-200',
        subtext: 'text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
    },
    {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800/60',
        text: 'text-purple-900 dark:text-purple-200',
        subtext: 'text-purple-600 dark:text-purple-400',
        accent: 'bg-purple-500',
    },
    {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-800/60',
        text: 'text-rose-900 dark:text-rose-200',
        subtext: 'text-rose-600 dark:text-rose-400',
        accent: 'bg-rose-500',
    },
    {
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        border: 'border-cyan-200 dark:border-cyan-800/60',
        text: 'text-cyan-900 dark:text-cyan-200',
        subtext: 'text-cyan-600 dark:text-cyan-400',
        accent: 'bg-cyan-500',
    },
];

export function getGroupPalette(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % COLOR_PALETTES.length;
    return COLOR_PALETTES[index];
}

export type GroupPalette = (typeof COLOR_PALETTES)[number];
