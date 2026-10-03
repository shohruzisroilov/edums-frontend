'use client';

import { DatePicker } from '@/components/ui/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/shadcn/select';
import { cn } from '@/utils/cn';
import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';

const controlClasses =
    'w-full rounded-lg border border-card-border bg-input-background px-4 py-2.5 text-sm text-title-50 outline-none transition placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:opacity-60';

function FieldShell({
    label,
    htmlFor,
    required,
    error,
    hint,
    hintId,
    errorId,
    labelId,
    children,
}: {
    label?: string;
    htmlFor: string;
    required?: boolean;
    error?: string;
    hint?: string;
    hintId: string;
    errorId: string;
    labelId?: string;
    children: ReactNode;
}) {
    return (
        <div className='flex flex-col gap-1.5'>
            {label && (
                <label
                    id={labelId}
                    htmlFor={htmlFor}
                    className='text-text-primary text-sm font-medium'
                >
                    {label}
                    {required && (
                        <span className='text-red-500' aria-hidden='true'>
                            {' '}
                            *
                        </span>
                    )}
                </label>
            )}
            {children}
            {hint && !error && (
                <p id={hintId} className='text-text-tertiary text-xs'>
                    {hint}
                </p>
            )}
            {/* role="alert" — ekran o'quvchi xatoni darhol o'qiydi. */}
            {error && (
                <p id={errorId} role='alert' className='text-xs text-red-500'>
                    {error}
                </p>
            )}
        </div>
    );
}

interface BaseProps {
    label?: string;
    error?: string;
    hint?: string;
}

/**
 * Maydonni izoh va xato matni bilan bog'laydi: `aria-describedby` bo'lmasa
 * ekran o'quvchi ularni umuman o'qimaydi.
 */
function useFieldIds(id: string | undefined) {
    const generated = useId();
    const base = id ?? generated;
    return {
        inputId: base,
        hintId: `${base}-hint`,
        errorId: `${base}-error`,
        labelId: `${base}-label`,
    };
}

function describedBy(
    hint: string | undefined,
    error: string | undefined,
    hintId: string,
    errorId: string,
): string | undefined {
    const ids = [error ? errorId : hint ? hintId : null].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
}

export function TextInput({
    label,
    error,
    hint,
    prefix,
    suffix,
    action,
    className,
    id,
    ...props
}: BaseProps &
    ComponentProps<'input'> & {
        /** Maydon ichida, chap tomonda turadigan o'zgarmas qism: "+998". */
        prefix?: string;
        /** Maydon ichida, o'ng tomonda turadigan birlik: "so'm", "kun". */
        suffix?: string;
        /** Maydon ichida, o'ng chetda turadigan tugma: parolni ko'rsatish. */
        action?: ReactNode;
    }) {
    const ids = useFieldIds(id);

    if (props.type === 'date') {
        return (
            <DateInputField
                label={label}
                error={error}
                hint={hint}
                prefix={prefix}
                suffix={suffix}
                action={action}
                className={className}
                ids={ids}
                {...props}
            />
        );
    }

    const { inputId, hintId, errorId } = ids;

    const field = (
        <input
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(hint, error, hintId, errorId)}
            className={cn(
                controlClasses,
                prefix && 'pl-14',
                suffix && 'pr-16',
                action && 'pr-11',
                error &&
                    'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                className,
            )}
            {...props}
        />
    );

    return (
        <FieldShell
            label={label}
            htmlFor={inputId}
            required={props.required}
            error={error}
            hint={hint}
            hintId={hintId}
            errorId={errorId}
        >
            {prefix || suffix || action ? (
                <div className='relative'>
                    {/*
                        Prefiks va birlik maydon ichida turadi, lekin
                        kiritiladigan qiymatning bir qismi emas: shuning uchun
                        bosishga javob bermaydi va ekran o'quvchidan yashiriladi.
                    */}
                    {prefix && (
                        <span
                            aria-hidden='true'
                            className='text-text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm'
                        >
                            {prefix}
                        </span>
                    )}
                    {field}
                    {suffix && (
                        <span
                            aria-hidden='true'
                            className='text-text-tertiary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm'
                        >
                            {suffix}
                        </span>
                    )}
                    {action && (
                        <div className='absolute top-1/2 right-1.5 -translate-y-1/2'>
                            {action}
                        </div>
                    )}
                </div>
            ) : (
                field
            )}
        </FieldShell>
    );
}

function DateInputField({
    label,
    error,
    hint,
    prefix,
    suffix,
    action,
    className,
    ids,
    value,
    defaultValue,
    onChange,
    onBlur,
    onKeyDown,
    placeholder,
    min,
    max,
    disabled,
    required,
    name,
    size: _htmlSize,
    ...restProps
}: BaseProps &
    ComponentProps<'input'> & {
        prefix?: string;
        suffix?: string;
        action?: ReactNode;
        ids: ReturnType<typeof useFieldIds>;
    }) {
    const { inputId } = ids;

    return (
        <DatePicker
            {...restProps}
            id={inputId}
            name={name}
            label={label}
            error={error}
            hint={hint}
            prefix={prefix}
            suffix={suffix}
            action={action}
            disabled={disabled}
            required={required}
            min={min ? String(min) : undefined}
            max={max ? String(max) : undefined}
            placeholder={placeholder}
            value={value !== undefined ? String(value) : undefined}
            defaultValue={
                defaultValue !== undefined ? String(defaultValue) : undefined
            }
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={className}
        />
    );
}

export function TextareaInput({
    label,
    error,
    hint,
    className,
    id,
    ...props
}: BaseProps & ComponentProps<'textarea'>) {
    const { inputId, hintId, errorId } = useFieldIds(id);

    return (
        <FieldShell
            label={label}
            htmlFor={inputId}
            required={props.required}
            error={error}
            hint={hint}
            hintId={hintId}
            errorId={errorId}
        >
            <textarea
                id={inputId}
                rows={3}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(hint, error, hintId, errorId)}
                className={cn(
                    controlClasses,
                    'resize-y',
                    error &&
                        'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                    className,
                )}
                {...props}
            />
        </FieldShell>
    );
}

interface SelectOption {
    value: string;
    label: string;
}

/**
 * Radix `value=""` ni qabul qilmaydi (bo'sh satr "tanlanmagan" degani).
 * Filtrlarda esa "barchasi" varianti aynan bo'sh satr bilan ifodalanadi,
 * shuning uchun ichkarida shartli kalitga almashtiriladi.
 */
const ALL_OPTION_VALUE = '__all__';

/**
 * shadcn/ui Select ustidagi forma maydoni.
 *
 * Native `<select>` dan voz kechildi: uning ochiladigan ro'yxatini
 * operatsion tizim chizadi, shuning uchun uni loyihaning mavzusi bilan
 * moslashtirib bo'lmasdi (faqat `color-scheme` orqali qisman). Radix esa
 * ro'yxatni oddiy DOM'da chizadi — ikkala mavzuda ham bir xil ko'rinadi,
 * tanlangan variantda belgi turadi, klaviatura va yozib qidirish ishlaydi.
 *
 * Radix yashirin `<select>` ham qo'shadi, shuning uchun forma odatdagidek
 * `name` bilan yuboriladi.
 */
export function SelectInput({
    label,
    error,
    hint,
    options,
    placeholder,
    value,
    onValueChange,
    required,
    disabled,
    name,
    className,
    id,
    'aria-label': ariaLabel,
}: BaseProps & {
    options: SelectOption[];
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    name?: string;
    className?: string;
    id?: string;
    /** Ko'rinadigan yorlig'i yo'q maydon uchun (filtr qatori). */
    'aria-label'?: string;
}) {
    const { inputId, hintId, errorId, labelId } = useFieldIds(id);

    return (
        <FieldShell
            label={label}
            htmlFor={inputId}
            required={required}
            error={error}
            hint={hint}
            hintId={hintId}
            errorId={errorId}
            labelId={labelId}
        >
            <Select
                value={value === '' ? ALL_OPTION_VALUE : value}
                onValueChange={(next) =>
                    onValueChange(next === ALL_OPTION_VALUE ? '' : next)
                }
                required={required}
                disabled={disabled}
                name={name}
            >
                {/*
                    Trigger — <button>, shuning uchun nomi <label for> orqali
                    emas, aniq `aria-labelledby` orqali beriladi: tugma uchun
                    yorliq bog'lanishiga hamma brauzer ham tayanmaydi.
                */}
                <SelectTrigger
                    id={inputId}
                    invalid={!!error}
                    aria-labelledby={
                        label ? `${labelId} ${inputId}` : undefined
                    }
                    aria-label={label ? undefined : ariaLabel}
                    aria-describedby={describedBy(hint, error, hintId, errorId)}
                    className={className}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    {/*
                        Radix bo'sh qiymatli variantni qabul qilmaydi, shuning
                        uchun "hammasi" varianti alohida kalit bilan yuritiladi
                        va tashqariga bo'sh satr sifatida qaytariladi.
                    */}
                    {placeholder !== undefined && (
                        <SelectItem value={ALL_OPTION_VALUE}>
                            {placeholder}
                        </SelectItem>
                    )}
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FieldShell>
    );
}

export function CheckboxInput({
    label,
    className,
    id,
    ...props
}: { label: string } & ComponentProps<'input'>) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <label
            htmlFor={inputId}
            className='text-text-primary flex cursor-pointer items-center gap-2.5 text-sm font-medium'
        >
            <input
                id={inputId}
                type='checkbox'
                className={cn(
                    'border-card-border text-brand-accent focus:ring-brand-accent/30 size-4.5 rounded focus:ring-2',
                    className,
                )}
                {...props}
            />
            {label}
        </label>
    );
}
