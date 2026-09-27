import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

const tableRootStyles = cva(
    'border-border-primary min-w-full border-separate border-spacing-0 overflow-clip text-left',
    {
        variants: {
            fullBleed: {
                true: 'border-y',
                false: 'rounded-lg border',
            },
        },
        defaultVariants: {
            fullBleed: false,
        },
    },
);

type TableRootProps = ComponentProps<'table'> &
    VariantProps<typeof tableRootStyles>;

export function TableRoot({ className, fullBleed, ...props }: TableRootProps) {
    return (
        <div className='overflow-x-auto scrollbar-thin'>
            <table
                className={cn(tableRootStyles({ fullBleed }), className)}
                {...props}
            />
        </div>
    );
}

/**
 * Sarlavha qatori ustun nomlarini "yorliq" darajasiga tushiradi: kichik,
 * kattalashtirilgan harflar oralig'i bilan. Shunda ma'lumot qatorlari
 * ko'zga birinchi tashlanadi, ustun nomlari esa fon vazifasini bajaradi.
 */
const tableHeaderStyles = cva(
    'bg-background-gray-primary/40 [&_th]:border-border-primary [&_th]:text-text-tertiary [&_th]:border-b [&_th]:text-[0.65rem] sm:[&_th]:text-[0.6875rem] [&_th]:font-semibold [&_th]:tracking-[0.06em] [&_th]:uppercase',
);

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
    return <thead className={cn(tableHeaderStyles(), className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
    return <tbody className={className} {...props} />;
}

const cellPadding = 'px-3 sm:px-5 py-2.5 sm:py-3.5 whitespace-nowrap text-xs sm:text-sm';

const tableHeadStyles = cva(cellPadding, {
    variants: {
        // Raqamlar o'ngga tekislanadi — birlik, o'nlik, yuzlik ustun bo'ylab
        // bir chiziqda turadi va qiymatlarni taqqoslash osonlashadi.
        numeric: { true: 'text-right', false: '' },
    },
    defaultVariants: { numeric: false },
});

export function TableHead({
    className,
    numeric,
    ...props
}: ComponentProps<'th'> & VariantProps<typeof tableHeadStyles>) {
    return (
        <th
            className={cn(tableHeadStyles({ numeric }), className)}
            {...props}
        />
    );
}

/**
 * Qator ustiga sichqoncha kelganda fon o'zgaradi — uzun jadvallarda ko'z
 * qaysi qatorda ekanini yo'qotmaydi. `group` esa amal tugmalariga shu
 * holatga qarab reaksiya qilish imkonini beradi.
 */
const tableRowStyles = cva(
    'group hover:bg-background-gray-primary/35 transition-colors not-last:*:border-border-primary not-last:[&>td]:border-b not-last:[&>th]:border-b',
);

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
    return <tr className={cn(tableRowStyles(), className)} {...props} />;
}

const tableCellStyles = cva(
    cn(cellPadding, 'text-text-secondary font-medium tabular-nums'),
    {
        variants: {
            numeric: { true: 'text-right', false: '' },
            /** Qatorning asosiy ustuni — ismi yoki nomi. */
            primary: { true: 'text-text-primary font-semibold', false: '' },
        },
        defaultVariants: { numeric: false, primary: false },
    },
);

export function TableCell({
    className,
    numeric,
    primary,
    ...props
}: ComponentProps<'td'> & VariantProps<typeof tableCellStyles>) {
    return (
        <td
            className={cn(tableCellStyles({ numeric, primary }), className)}
            {...props}
        />
    );
}
