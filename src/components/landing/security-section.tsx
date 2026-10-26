'use client';

import { useT } from '@/i18n/provider';
import { SUPPORT_CONTACTS } from '@/utils/site';
import {
    Check,
    Download1,
    FileText,
    Locked3,
    Shield1Check,
    UploadCloud,
} from '@tailgrids/icons';
import { SectionHeading } from './section-heading';

export function SecuritySection({ onStart }: { onStart?: () => void }) {
    const t = useT();

    return (
        <section
            id='security'
            className='mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:py-24'
        >
            <SectionHeading
                eyebrow={t('landing.securityEyebrow')}
                title={t('landing.securityTitle')}
                text={t('landing.securitySubtitle')}
            />

            {/* ── Jonli Xavfsizlik Paneli (Trust & Status Widget) ── */}
            <div className='border-card-border bg-card-background relative mt-12 overflow-hidden rounded-2xl border p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-10'>
                {/* Fon naqshlari */}
                <div
                    aria-hidden='true'
                    className='bg-brand-500/5 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl'
                />
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-emerald-500/5 blur-3xl'
                />

                <div className='relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center'>
                    <div className='flex items-center gap-4'>
                        <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 sm:size-16 dark:text-emerald-400'>
                            <Shield1Check className='size-8' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2.5'>
                                <span className='relative flex size-2.5'>
                                    <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75' />
                                    <span className='relative inline-flex size-2.5 rounded-full bg-emerald-500' />
                                </span>
                                <h3 className='text-text-primary text-lg font-bold sm:text-xl'>
                                    {t('landing.securityStatusTitle')}
                                </h3>
                            </div>
                            <p className='text-text-secondary mt-1 text-sm'>
                                {t('landing.securityStatusSubtitle')} ·{' '}
                                {t('landing.securityStatusUptime')}
                            </p>
                        </div>
                    </div>

                    <div className='grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:gap-4'>
                        <div className='border-card-border bg-background-gray-secondary/70 rounded-xl border p-3 text-center sm:p-4'>
                            <p className='text-text-primary text-xs font-semibold sm:text-sm'>
                                {t('landing.securityStatusBackup')}
                            </p>
                            <p className='text-text-tertiary mt-1 text-[11px]'>
                                {t('landing.securityStatusBackupSub')}
                            </p>
                        </div>
                        <div className='border-card-border bg-background-gray-secondary/70 rounded-xl border p-3 text-center sm:p-4'>
                            <p className='text-text-primary text-xs font-semibold sm:text-sm'>
                                {t('landing.securityStatusExport')}
                            </p>
                            <p className='text-text-tertiary mt-1 text-[11px]'>
                                {t('landing.securityStatusExportSub')}
                            </p>
                        </div>
                        <div className='border-card-border bg-background-gray-secondary/70 rounded-xl border p-3 text-center sm:p-4'>
                            <p className='text-text-primary text-xs font-semibold sm:text-sm'>
                                SSL 256-bit
                            </p>
                            <p className='text-text-tertiary mt-1 text-[11px]'>
                                HTTPS / TLS 1.3
                            </p>
                        </div>
                        <div className='border-card-border bg-background-gray-secondary/70 rounded-xl border p-3 text-center sm:p-4'>
                            <p className='text-text-primary text-xs font-semibold sm:text-sm'>
                                {t('landing.securityStatusContract')}
                            </p>
                            <p className='text-text-tertiary mt-1 text-[11px]'>
                                {t('landing.securityStatusContractSub')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4 Asosiy Xavfsizlik Ustuni (Pillars) ── */}
            <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
                {/* 1. Avtomatik Zaxira */}
                <div className='border-card-border bg-card-background hover:border-brand-500/40 relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:rounded-3xl sm:p-8'>
                    <div>
                        <div className='flex items-center justify-between gap-3'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 sm:size-14 sm:rounded-2xl dark:text-blue-400'>
                                <UploadCloud className='size-6 sm:size-7' />
                            </div>
                            <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300'>
                                {t('landing.securityBackupBadge')}
                            </span>
                        </div>

                        <h3 className='text-text-primary mt-6 text-xl font-bold sm:text-2xl'>
                            {t('landing.securityBackupTitle')}
                        </h3>
                        <p className='text-text-secondary mt-3 text-sm leading-relaxed sm:text-base'>
                            {t('landing.securityBackupText')}
                        </p>
                    </div>

                    <ul className='border-card-border text-text-secondary mt-6 space-y-2.5 border-t pt-5 text-xs sm:text-sm'>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Alohida ajratilgan xavfsiz bulutda shifrlangan
                                saqlash
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Kutilmagan texnik vaziyatlarda 30 daqiqada qayta
                                tiklash (RTO)
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                O‘quvchilar, qarzdorliklar va to‘lovlar tarixi
                                to‘liq daxlsiz
                            </span>
                        </li>
                    </ul>
                </div>

                {/* 2. Ma'lumot mustaqilligi va Eksport */}
                <div className='border-card-border bg-card-background hover:border-brand-500/40 relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:rounded-3xl sm:p-8'>
                    <div>
                        <div className='flex items-center justify-between gap-3'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 sm:size-14 sm:rounded-2xl dark:text-emerald-400'>
                                <Download1 className='size-6 sm:size-7' />
                            </div>
                            <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
                                {t('landing.securityOwnershipBadge')}
                            </span>
                        </div>

                        <h3 className='text-text-primary mt-6 text-xl font-bold sm:text-2xl'>
                            {t('landing.securityOwnershipTitle')}
                        </h3>
                        <p className='text-text-secondary mt-3 text-sm leading-relaxed sm:text-base'>
                            {t('landing.securityOwnershipText')}
                        </p>
                    </div>

                    <ul className='border-card-border text-text-secondary mt-6 space-y-2.5 border-t pt-5 text-xs sm:text-sm'>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Excel (.xlsx) va CSV formatlarida to‘liq eksport
                                imkoniyati
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Hech qanday vendor-lock (platformaga bog‘lanib
                                qolish) yo‘q
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Istalgan vaqtda shaxsiy kompyuterga nusxa
                                ko‘chirib olish
                            </span>
                        </li>
                    </ul>
                </div>

                {/* 3. Bank darajasidagi shifrlash */}
                <div className='border-card-border bg-card-background hover:border-brand-500/40 relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:rounded-3xl sm:p-8'>
                    <div>
                        <div className='flex items-center justify-between gap-3'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 sm:size-14 sm:rounded-2xl dark:text-purple-400'>
                                <Locked3 className='size-6 sm:size-7' />
                            </div>
                            <span className='rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300'>
                                {t('landing.securityEncryptionBadge')}
                            </span>
                        </div>

                        <h3 className='text-text-primary mt-6 text-xl font-bold sm:text-2xl'>
                            {t('landing.securityEncryptionTitle')}
                        </h3>
                        <p className='text-text-secondary mt-3 text-sm leading-relaxed sm:text-base'>
                            {t('landing.securityEncryptionText')}
                        </p>
                    </div>

                    <ul className='border-card-border text-text-secondary mt-6 space-y-2.5 border-t pt-5 text-xs sm:text-sm'>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Bank standarti: HTTPS / TLS 1.3 shifrlangan
                                kanallar
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Bcrypt qaytarib bo‘lmas algoritmi bilan
                                parollarni himoyalash
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Multi-tenant izolyatsiya: boshqa markaz
                                ma’lumotlaringizni ko‘ra olmaydi
                            </span>
                        </li>
                    </ul>
                </div>

                {/* 4. Rasmiy shartnoma va NDA */}
                <div className='border-card-border bg-card-background hover:border-brand-500/40 relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:rounded-3xl sm:p-8'>
                    <div>
                        <div className='flex items-center justify-between gap-3'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 sm:size-14 sm:rounded-2xl dark:text-amber-400'>
                                <FileText className='size-6 sm:size-7' />
                            </div>
                            <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300'>
                                {t('landing.securityLegalBadge')}
                            </span>
                        </div>

                        <h3 className='text-text-primary mt-6 text-xl font-bold sm:text-2xl'>
                            {t('landing.securityLegalTitle')}
                        </h3>
                        <p className='text-text-secondary mt-3 text-sm leading-relaxed sm:text-base'>
                            {t('landing.securityLegalText')}
                        </p>
                    </div>

                    <ul className='border-card-border text-text-secondary mt-6 space-y-2.5 border-t pt-5 text-xs sm:text-sm'>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                Maxfiylik kelishuvi (NDA) — ma’lumotlar hech
                                kimga oshkor qilinmaydi
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                99.5% Uptime kafolati (SLA) rasmiy shartnomada
                                belgilanadi
                            </span>
                        </li>
                        <li className='flex items-center gap-2.5'>
                            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400'>
                                <Check className='size-3.5' />
                            </span>
                            <span>
                                To‘liq moddiy javobgarlik va ma’lumotlar
                                daxlsizligi shartlari
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Qo'shimcha Ishonch Banneri (Contact & Contract Prompt) ── */}
            <div className='border-card-border bg-background-gray-secondary/80 mt-10 flex flex-col items-center justify-between gap-6 rounded-2xl border p-6 sm:flex-row sm:rounded-3xl sm:p-8'>
                <div className='flex items-start gap-4'>
                    <div className='bg-brand-500/10 text-brand-500 hidden size-12 shrink-0 items-center justify-center rounded-2xl sm:flex'>
                        <Shield1Check className='size-6' />
                    </div>
                    <div>
                        <h4 className='text-text-primary text-base font-bold sm:text-lg'>
                            Shartnomada xavfsizlik kafolatini xohlaysizmi?
                        </h4>
                        <p className='text-text-secondary mt-1 max-w-2xl text-xs sm:text-sm'>
                            {t('landing.securityBannerText')}
                        </p>
                    </div>
                </div>

                <div className='flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row'>
                    <a
                        href={SUPPORT_CONTACTS.telegramPersonalUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-brand-500 hover:bg-brand-600 inline-flex items-center justify-center rounded-xl px-5 py-3 text-center text-xs font-bold text-white shadow-sm transition active:scale-95 sm:text-sm'
                    >
                        {t('landing.securityBannerAction')} →
                    </a>
                    {onStart && (
                        <button
                            type='button'
                            onClick={onStart}
                            className='border-card-border bg-card-background text-text-primary hover:bg-background-gray-secondary inline-flex cursor-pointer items-center justify-center rounded-xl border px-5 py-3 text-center text-xs font-bold transition active:scale-95 sm:text-sm'
                        >
                            Bepul sinab ko‘rish
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
