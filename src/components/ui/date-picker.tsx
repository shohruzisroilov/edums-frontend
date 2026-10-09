'use client';

import { CalendarIcon } from '@/components/ui/calendar-icon';
import { useLocale } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import {
    isoToDisplayDate,
    isValidISODate,
    normalizeDateString,
} from '@/utils/format';
import { ChevronLeft, ChevronRight } from '@tailgrids/icons';
import {
    useEffect,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

// 4 ta til bo'yicha lug'atlar (O'zbek lotin, O'zbek kirill, Rus, Ingliz)
const I18N_DATA = {
    uz: {
        months: [
            'Yanvar',
            'Fevral',
            'Mart',
            'Aprel',
            'May',
            'Iyun',
            'Iyul',
            'Avgust',
            'Sentabr',
            'Oktabr',
            'Noyabr',
            'Dekabr',
        ],
        monthsShort: [
            'Yan',
            'Fev',
            'Mar',
            'Apr',
            'May',
            'Iyn',
            'Iyl',
            'Avg',
            'Sen',
            'Okt',
            'Noy',
            'Dek',
        ],
        weekdaysShort: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
        today: 'Bugun',
        clear: 'Tozalash',
        close: 'Yopish',
        placeholder: 'KK.OO.YYYY',
        hint: 'Kun.Oy.Yil (masalan: 30.09.2026)',
        selectDate: 'Kalendardan tanlash',
        prevMonth: 'Oldingi oy',
        nextMonth: 'Keyingi oy',
    },
    'uz-cyrl': {
        months: [
            'Январ',
            'Феврал',
            'Март',
            'Апрел',
            'Май',
            'Июн',
            'Июл',
            'Август',
            'Сентябр',
            'Октябр',
            'Ноябр',
            'Декабр',
        ],
        monthsShort: [
            'Янв',
            'Фев',
            'Мар',
            'Апр',
            'Май',
            'Июн',
            'Июл',
            'Авг',
            'Сен',
            'Окт',
            'Ноя',
            'Дек',
        ],
        weekdaysShort: ['Ду', 'Се', 'Чор', 'Пай', 'Жу', 'Ша', 'Як'],
        today: 'Бугун',
        clear: 'Тозалаш',
        close: 'Ёпиш',
        placeholder: 'КК.ОО.ЙЙЙЙ',
        hint: 'Кун.Ой.Йил (масалан: 30.09.2026)',
        selectDate: 'Календардан танлаш',
        prevMonth: 'Олдинги ой',
        nextMonth: 'Кейинги ой',
    },
    ru: {
        months: [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь',
        ],
        monthsShort: [
            'Янв',
            'Фев',
            'Мар',
            'Апр',
            'Май',
            'Июн',
            'Июл',
            'Авг',
            'Сен',
            'Окт',
            'Ноя',
            'Дек',
        ],
        weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        today: 'Сегодня',
        clear: 'Очистить',
        close: 'Закрыть',
        placeholder: 'ДД.ММ.ГГГГ',
        hint: 'День.Месяц.Год (например: 30.09.2026)',
        selectDate: 'Выбрать дату',
        prevMonth: 'Предыдущий месяц',
        nextMonth: 'Следующий месяц',
    },
    en: {
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        monthsShort: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
        weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        today: 'Today',
        clear: 'Clear',
        close: 'Close',
        placeholder: 'DD.MM.YYYY',
        hint: 'Day.Month.Year (e.g. 30.09.2026)',
        selectDate: 'Select date',
        prevMonth: 'Previous month',
        nextMonth: 'Next month',
    },
} as const;

export interface DatePickerProps extends Omit<
    ComponentProps<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix'
> {
    /** ISO formatdagi sana: "YYYY-MM-DD" yoki bo'sh satr "" */
    value?: string;
    defaultValue?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onDateChange?: (isoDate: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    action?: ReactNode;
    disabled?: boolean;
    required?: boolean;
    min?: string; // ISO: "YYYY-MM-DD"
    max?: string; // ISO: "YYYY-MM-DD"
    name?: string;
    id?: string;
    className?: string;
    inputClassName?: string;
    size?: 'sm' | 'md';
    align?: 'left' | 'right';
    autoOpenOnFocus?: boolean;
    showHint?: boolean;
}

/** Raqam kiritilayotganda DD.MM.YYYY maskasini hosil qiladi */
function applyDateMask(raw: string, prev: string): string {
    // Agar foydalanuvchi matnni qisqartirayotgan bo'lsa (o'chirish), avtomatik nuqta qo'shmaymiz
    if (raw.length < prev.length) {
        return raw;
    }

    // ISO format paste qilingan bo'lsa (2026-09-30)
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
        const [y, m, d] = raw.trim().split('-');
        return `${d}.${m}.${y}`;
    }

    // Faqat raqamlar (maksimal 8 ta raqam: 2 ta kun, 2 ta oy, 4 ta yil)
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (!digits) return '';

    let formatted = '';
    if (digits.length <= 2) {
        formatted = digits;
        if (digits.length === 2 && !raw.endsWith('.')) {
            formatted += '.';
        }
    } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length === 4 && !raw.endsWith('.')) {
            formatted += '.';
        }
    } else {
        formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
    }
    return formatted;
}

export function DatePicker({
    value,
    defaultValue,
    onChange,
    onDateChange,
    placeholder,
    label,
    error,
    hint,
    prefix,
    suffix,
    action,
    disabled,
    required,
    min,
    max,
    name,
    id,
    className,
    inputClassName,
    size = 'md',
    align = 'left',
    autoOpenOnFocus = false,
    showHint = false,
    onBlur,
    onKeyDown,
    onFocus,
    ...restInputProps
}: DatePickerProps) {
    const { locale } = useLocale();
    const texts = I18N_DATA[locale] || I18N_DATA.uz;
    const defaultPlaceholder = placeholder || texts.placeholder;

    const generatedId = useId();
    const inputId = id || generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Initial state: tashqaridan kelgan value "YYYY-MM-DD" bo'lsa "DD.MM.YYYY" ga o'giriladi
    const initialIso =
        value !== undefined
            ? value
            : defaultValue !== undefined
              ? defaultValue
              : '';
    const [prevPropValue, setPrevPropValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(() =>
        isoToDisplayDate(initialIso),
    );
    const [isOpen, setIsOpen] = useState(false);
    const [openDirection, setOpenDirection] = useState<'bottom' | 'top'>(
        'bottom',
    );

    // Popover view rejimi: 'days' | 'months' | 'years'
    const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>(
        'days',
    );

    // Kalendar ichida qaysi oy/yil ko'rinishi
    const today = new Date();
    const initialDateObj = isValidISODate(initialIso)
        ? new Date(
              parseInt(initialIso.slice(0, 4), 10),
              parseInt(initialIso.slice(5, 7), 10) - 1,
              parseInt(initialIso.slice(8, 10), 10),
          )
        : today;

    const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth()); // 0-11

    // Tashqi `value` o'zgarganda ichki `displayValue`ni sinxronlashtirish
    if (value !== prevPropValue) {
        setPrevPropValue(value);
        const newDisplay = isoToDisplayDate(value || '');
        setDisplayValue(newDisplay);
        if (value && isValidISODate(value)) {
            const [y, m] = value.split('-').map(Number);
            setViewYear(y);
            setViewMonth(m - 1);
        }
    }

    // Qiymatni tashqi formaga yuborish
    const emitValue = (nextIso: string) => {
        if (onDateChange) {
            onDateChange(nextIso);
        }
        if (onChange) {
            const syntheticEvent = {
                target: { value: nextIso, name: name || '' },
                currentTarget: { value: nextIso, name: name || '' },
            } as unknown as ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
    };

    // Kalendardan sana tanlanganda
    const handleSelectDate = (year: number, month: number, day: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const nextIso = `${year}-${pad(month + 1)}-${pad(day)}`;
        const nextDisplay = `${pad(day)}.${pad(month + 1)}.${year}`;

        setDisplayValue(nextDisplay);
        emitValue(nextIso);
        setIsOpen(false);
        setViewMode('days');
        inputRef.current?.focus();
    };

    // "Bugun" tugmasi bosilganda
    const handleSelectToday = () => {
        const now = new Date();
        handleSelectDate(now.getFullYear(), now.getMonth(), now.getDate());
    };

    // "Tozalash" tugmasi bosilganda
    const handleClear = () => {
        setDisplayValue('');
        emitValue('');
        setIsOpen(false);
        setViewMode('days');
        inputRef.current?.focus();
    };

    // Qo'lda yozish
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        const masked = applyDateMask(inputVal, displayValue);
        setDisplayValue(masked);

        if (!masked.trim()) {
            emitValue('');
            return;
        }

        // Agar to'liq sana kiritilgan bo'lsa (DD.MM.YYYY yoki YYYY-MM-DD)
        const normalized = normalizeDateString(masked);
        if (normalized) {
            emitValue(normalized);
            const [y, m] = normalized.split('-').map(Number);
            setViewYear(y);
            setViewMonth(m - 1);
        }
    };

    const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
        const trimmed = displayValue.trim();
        if (!trimmed) {
            if (value) emitValue('');
        } else {
            const normalized = normalizeDateString(trimmed);
            if (normalized) {
                const formatted = isoToDisplayDate(normalized);
                setDisplayValue(formatted);
                if (normalized !== value) {
                    emitValue(normalized);
                }
            } else {
                // Agar noto'liq yoki noto'g'ri kiritilgan bo'lsa, avvalgi to'g'ri qiymatga qaytarish
                setDisplayValue(isoToDisplayDate(value || ''));
            }
        }
        onBlur?.(e);
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const normalized = normalizeDateString(displayValue.trim());
            if (normalized) {
                setDisplayValue(isoToDisplayDate(normalized));
                emitValue(normalized);
                setIsOpen(false);
            }
        } else if (e.key === 'ArrowDown') {
            if (!isOpen) {
                e.preventDefault();
                openCalendar();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
        onKeyDown?.(e);
    };

    // Kalendarni ochish va ekrandagi o'rnini tekshirish
    const openCalendar = () => {
        if (disabled) return;
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < 340 && spaceAbove > spaceBelow) {
                setOpenDirection('top');
            } else {
                setOpenDirection('bottom');
            }
        }
        setViewMode('days');
        setIsOpen(true);
    };

    const toggleCalendar = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            openCalendar();
        }
    };

    // Tashqariga bosilganda popoverni yopish
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        function handleEsc(event: globalThis.KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // Oyni almashtirish
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    // Min/Max cheklovi tekshiruvi
    const isDateDisabled = (year: number, month: number, day: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
        if (min && iso < min) return true;
        if (max && iso > max) return true;
        return false;
    };

    // Joriy oy kunlari matritsasi
    const calendarDays = (() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

        // O'zbekistonda hafta Dushanbadan boshlanadi: 0 = Du, ..., 6 = Ya
        const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
        const totalDays = lastDayOfMonth.getDate();

        // Oldingi oyning oxirgi kunlari
        const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
        const prevDays: {
            year: number;
            month: number;
            day: number;
            isCurrentMonth: boolean;
        }[] = [];
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = prevMonthLastDay - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            const y = viewMonth === 0 ? viewYear - 1 : viewYear;
            prevDays.push({ year: y, month: m, day: d, isCurrentMonth: false });
        }

        // Joriy oy kunlari
        const currentDays: {
            year: number;
            month: number;
            day: number;
            isCurrentMonth: boolean;
        }[] = [];
        for (let d = 1; d <= totalDays; d++) {
            currentDays.push({
                year: viewYear,
                month: viewMonth,
                day: d,
                isCurrentMonth: true,
            });
        }

        // Keyingi oy kunlari (jadval to'liq 35 yoki 42 bo'lishi uchun)
        const combined = [...prevDays, ...currentDays];
        const nextDaysCount = (7 - (combined.length % 7)) % 7;
        const nextDays: {
            year: number;
            month: number;
            day: number;
            isCurrentMonth: boolean;
        }[] = [];
        for (let d = 1; d <= nextDaysCount; d++) {
            const m = viewMonth === 11 ? 0 : viewMonth + 1;
            const y = viewMonth === 11 ? viewYear + 1 : viewYear;
            nextDays.push({ year: y, month: m, day: d, isCurrentMonth: false });
        }

        return [...combined, ...nextDays];
    })();

    // Tanlangan sana bilan mos kelishini tekshirish
    const isSelected = (year: number, month: number, day: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
        return Boolean(value && iso === value);
    };

    const isCurrentToday = (year: number, month: number, day: number) => {
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    // Yillar ro'yxati (1940 dan 2035 gacha)
    const yearList = Array.from({ length: 96 }, (_, i) => 2035 - i);

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className='text-text-primary mb-1.5 block text-sm font-medium'
                >
                    {label}
                    {required && (
                        <span
                            className='text-badge-error-text'
                            aria-hidden='true'
                        >
                            {' '}
                            *
                        </span>
                    )}
                </label>
            )}

            <div className='relative flex items-center'>
                {prefix && (
                    <span
                        aria-hidden='true'
                        className='text-text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm'
                    >
                        {prefix}
                    </span>
                )}

                <input
                    {...restInputProps}
                    ref={inputRef}
                    id={inputId}
                    name={name}
                    type='text'
                    inputMode='numeric'
                    autoComplete='off'
                    disabled={disabled}
                    required={required}
                    placeholder={defaultPlaceholder}
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    onFocus={(e) => {
                        if (autoOpenOnFocus && !isOpen) openCalendar();
                        onFocus?.(e);
                    }}
                    className={cn(
                        'border-input-border bg-input-background text-title-50 placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-input-primary-focus-border/20 w-full rounded-lg border transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
                        size === 'sm'
                            ? 'h-9 px-3 pr-9 text-xs'
                            : 'h-11 px-3.5 pr-10 text-sm',
                        prefix && 'pl-14',
                        suffix && 'pr-20',
                        error &&
                            'border-error-500 focus:border-error-500 focus:ring-error-500/20',
                        inputClassName,
                    )}
                />

                {suffix && (
                    <span
                        aria-hidden='true'
                        className='text-text-tertiary pointer-events-none absolute top-1/2 right-12 -translate-y-1/2 text-sm'
                    >
                        {suffix}
                    </span>
                )}

                {/* Kalendar ochish tugmasi / action */}
                <div className='absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1'>
                    {action}
                    <button
                        type='button'
                        tabIndex={-1}
                        disabled={disabled}
                        aria-label={texts.selectDate}
                        title={texts.selectDate}
                        onClick={toggleCalendar}
                        className={cn(
                            'text-text-tertiary hover:text-brand-accent flex items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5',
                            size === 'sm' ? 'size-7' : 'size-8',
                            isOpen &&
                                'text-brand-accent bg-black/5 dark:bg-white/5',
                        )}
                    >
                        <CalendarIcon
                            className={size === 'sm' ? 'size-3.5' : 'size-4'}
                        />
                    </button>
                </div>
            </div>

            {/* Hint va Error */}
            {error ? (
                <p role='alert' className='text-badge-error-text mt-1 text-xs'>
                    {error}
                </p>
            ) : hint ? (
                <p className='text-text-tertiary mt-1 text-xs'>{hint}</p>
            ) : showHint ? (
                <p className='text-text-tertiary mt-1 text-xs'>{texts.hint}</p>
            ) : null}

            {/* Kalendar Popover */}
            {isOpen && (
                <div
                    ref={popoverRef}
                    className={cn(
                        'border-card-border bg-card-surface-area animate-in fade-in-0 zoom-in-95 absolute z-[9999] w-[min(310px,calc(100vw-1.5rem))] rounded-2xl border p-3.5 shadow-2xl sm:w-[320px]',
                        openDirection === 'bottom'
                            ? 'top-[calc(100%+6px)]'
                            : 'bottom-[calc(100%+6px)]',
                        align === 'right' ? 'right-0' : 'left-0',
                    )}
                >
                    {/* Header: Navigatsiya */}
                    <div className='mb-3 flex items-center justify-between gap-1'>
                        <button
                            type='button'
                            onClick={handlePrevMonth}
                            aria-label={texts.prevMonth}
                            title={texts.prevMonth}
                            className='text-text-secondary hover:text-text-primary hover:bg-background-gray-primary flex size-8 items-center justify-center rounded-lg transition'
                        >
                            <ChevronLeft className='size-4' />
                        </button>

                        <div className='flex items-center gap-1 text-sm font-semibold'>
                            <button
                                type='button'
                                onClick={() =>
                                    setViewMode(
                                        viewMode === 'months'
                                            ? 'days'
                                            : 'months',
                                    )
                                }
                                className={cn(
                                    'text-title-50 hover:text-brand-accent hover:bg-background-gray-primary rounded-lg px-2 py-1 transition',
                                    viewMode === 'months' &&
                                        'text-brand-accent bg-background-gray-primary',
                                )}
                            >
                                {texts.months[viewMonth]}
                            </button>
                            <button
                                type='button'
                                onClick={() =>
                                    setViewMode(
                                        viewMode === 'years' ? 'days' : 'years',
                                    )
                                }
                                className={cn(
                                    'text-title-50 hover:text-brand-accent hover:bg-background-gray-primary rounded-lg px-2 py-1 transition',
                                    viewMode === 'years' &&
                                        'text-brand-accent bg-background-gray-primary',
                                )}
                            >
                                {viewYear}
                            </button>
                        </div>

                        <button
                            type='button'
                            onClick={handleNextMonth}
                            aria-label={texts.nextMonth}
                            title={texts.nextMonth}
                            className='text-text-secondary hover:text-text-primary hover:bg-background-gray-primary flex size-8 items-center justify-center rounded-lg transition'
                        >
                            <ChevronRight className='size-4' />
                        </button>
                    </div>

                    {/* View: Oylarni tanlash rejimi */}
                    {viewMode === 'months' && (
                        <div className='grid grid-cols-3 gap-1.5 py-1'>
                            {texts.months.map((mName, mIdx) => {
                                const isCurrent = viewMonth === mIdx;
                                return (
                                    <button
                                        key={mName}
                                        type='button'
                                        onClick={() => {
                                            setViewMonth(mIdx);
                                            setViewMode('days');
                                        }}
                                        className={cn(
                                            'rounded-xl py-2 text-xs font-medium transition',
                                            isCurrent
                                                ? 'bg-brand-accent font-semibold text-white shadow-xs'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-background-gray-primary',
                                        )}
                                    >
                                        {mName}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* View: Yillarni tanlash rejimi */}
                    {viewMode === 'years' && (
                        <div className='max-h-56 scrollbar-thin overflow-y-auto pr-1'>
                            <div className='grid grid-cols-4 gap-1.5'>
                                {yearList.map((y) => {
                                    const isCurrent = viewYear === y;
                                    return (
                                        <button
                                            key={y}
                                            type='button'
                                            onClick={() => {
                                                setViewYear(y);
                                                setViewMode('days');
                                            }}
                                            className={cn(
                                                'rounded-xl py-2 text-xs font-medium transition',
                                                isCurrent
                                                    ? 'bg-brand-accent font-semibold text-white shadow-xs'
                                                    : 'text-text-secondary hover:text-text-primary hover:bg-background-gray-primary',
                                            )}
                                        >
                                            {y}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* View: Kunlar rejimi (Days) */}
                    {viewMode === 'days' && (
                        <div>
                            {/* Hafta kunlari qatori */}
                            <div className='mb-1 grid grid-cols-7 text-center'>
                                {texts.weekdaysShort.map((wName) => (
                                    <span
                                        key={wName}
                                        className='text-text-tertiary py-1 text-xs font-semibold'
                                    >
                                        {wName}
                                    </span>
                                ))}
                            </div>

                            {/* Kunlar to'ri */}
                            <div className='grid grid-cols-7 gap-1'>
                                {calendarDays.map((item, idx) => {
                                    const disabledDay = isDateDisabled(
                                        item.year,
                                        item.month,
                                        item.day,
                                    );
                                    const selected = isSelected(
                                        item.year,
                                        item.month,
                                        item.day,
                                    );
                                    const isToday = isCurrentToday(
                                        item.year,
                                        item.month,
                                        item.day,
                                    );

                                    return (
                                        <button
                                            key={`${item.year}-${item.month}-${item.day}-${idx}`}
                                            type='button'
                                            disabled={disabledDay}
                                            onClick={() =>
                                                handleSelectDate(
                                                    item.year,
                                                    item.month,
                                                    item.day,
                                                )
                                            }
                                            className={cn(
                                                'relative flex h-8 w-full items-center justify-center rounded-lg text-xs transition select-none',
                                                // Joriy yoki boshqa oy
                                                item.isCurrentMonth
                                                    ? 'text-text-primary'
                                                    : 'text-text-tertiary/40',
                                                // Tanlangan
                                                selected &&
                                                    'bg-brand-accent hover:bg-brand-accent/90 font-bold text-white shadow-xs',
                                                // Tanlanmagan va hover
                                                !selected &&
                                                    !disabledDay &&
                                                    'hover:bg-background-gray-primary',
                                                // Bugungi kun ko'rinishi
                                                isToday &&
                                                    !selected &&
                                                    'border-brand-accent text-brand-accent border font-semibold',
                                                // Disabled
                                                disabledDay &&
                                                    'cursor-not-allowed opacity-30 hover:bg-transparent',
                                            )}
                                        >
                                            {item.day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer: Bugun, Tozalash, Yopish */}
                    <div className='border-card-border mt-3 flex items-center justify-between border-t pt-2.5'>
                        <button
                            type='button'
                            onClick={handleSelectToday}
                            className='text-brand-accent hover:bg-background-gray-primary rounded-lg px-2.5 py-1 text-xs font-semibold transition'
                        >
                            {texts.today}
                        </button>

                        <div className='flex items-center gap-1'>
                            {displayValue && (
                                <button
                                    type='button'
                                    onClick={handleClear}
                                    className='text-text-tertiary hover:bg-background-gray-primary hover:text-badge-error-text rounded-lg px-2 py-1 text-xs font-medium transition'
                                >
                                    {texts.clear}
                                </button>
                            )}
                            <button
                                type='button'
                                onClick={() => setIsOpen(false)}
                                className='text-text-secondary hover:text-text-primary hover:bg-background-gray-primary rounded-lg px-2 py-1 text-xs font-medium transition'
                            >
                                {texts.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
