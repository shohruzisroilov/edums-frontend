'use client';

import { Button } from '@/components/tailgrids/core/button';
import { CodeBlock } from '@/components/ui/code-block';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { SectionCard } from '@/components/ui/section-card';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/locales';
import { useLocale, useT, type Translate } from '@/i18n/provider';
import { listCourses } from '@/services/api/courses';
import {
    disableLeadForm,
    getLeadForm,
    issueLeadFormKey,
    leadFormInfoUrl,
    leadFormScriptUrl,
    leadFormSubmitUrl,
} from '@/services/api/lead-form';
import type { LeadForm } from '@/types/api';
import { cn } from '@/utils/cn';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const METHODS = ['widget', 'html', 'tilda'] as const;
type Method = (typeof METHODS)[number];

/**
 * Markaz saytidagi forma: kalitni boshqarish va ulash yo'riqnomasi.
 * Kod namunalari shu yerda yig'iladi — ular markaz saytiga qo'yiladi.
 */
export function LeadFormSection() {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();
    const [confirming, setConfirming] = useState<
        'regenerate' | 'disable' | null
    >(null);

    const query = useQuery({ queryKey: ['lead-form'], queryFn: getLeadForm });
    const enabled = Boolean(query.data);

    const issueMutation = useMutation({
        mutationFn: issueLeadFormKey,
        onSuccess: (form) => {
            toast.success(
                t(enabled ? 'leadForm.regenerated' : 'leadForm.enabled'),
            );
            queryClient.setQueryData(['lead-form'], form);
            setConfirming(null);
        },
        onError: (error) => toastError(error),
    });

    const disableMutation = useMutation({
        mutationFn: disableLeadForm,
        onSuccess: () => {
            queryClient.setQueryData(['lead-form'], null);
            toast.success(t('leadForm.disabled'));
            setConfirming(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <SectionCard
            title={t('leadForm.title')}
            actions={
                query.data && (
                    <div className='flex flex-wrap gap-2'>
                        <Button
                            appearance='outline'
                            size='sm'
                            onPress={() => setConfirming('regenerate')}
                        >
                            {t('leadForm.regenerate')}
                        </Button>
                        <Button
                            variant='danger'
                            appearance='outline'
                            size='sm'
                            onPress={() => setConfirming('disable')}
                        >
                            {t('leadForm.disable')}
                        </Button>
                    </div>
                )
            }
        >
            <p className='text-text-tertiary text-sm'>{t('leadForm.hint')}</p>

            {query.isPending ? (
                <div className='mt-4'>
                    <TableSkeleton rows={2} columns={1} />
                </div>
            ) : query.error ? (
                <ErrorState error={query.error} />
            ) : query.data ? (
                <LeadFormGuide form={query.data} />
            ) : (
                <div className='mt-4'>
                    <Button
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={issueMutation.isPending}
                        onPress={() => issueMutation.mutate()}
                    >
                        {t('leadForm.enable')}
                    </Button>
                </div>
            )}

            <ConfirmDialog
                open={confirming === 'regenerate'}
                title={t('leadForm.regenerateTitle')}
                message={t('leadForm.regenerateMessage')}
                confirmLabel={t('leadForm.regenerate')}
                pending={issueMutation.isPending}
                onCancel={() => setConfirming(null)}
                onConfirm={() => issueMutation.mutate()}
            />
            <ConfirmDialog
                open={confirming === 'disable'}
                title={t('leadForm.disableTitle')}
                message={t('leadForm.disableMessage')}
                confirmLabel={t('leadForm.disable')}
                pending={disableMutation.isPending}
                onCancel={() => setConfirming(null)}
                onConfirm={() => disableMutation.mutate()}
            />
        </SectionCard>
    );
}

function LeadFormGuide({ form }: { form: LeadForm }) {
    const t = useT();
    const { formatDateTime } = useFormat();
    const [method, setMethod] = useState<Method>('widget');

    return (
        <div className='mt-4 flex flex-col gap-5'>
            <div>
                <p className='text-text-primary mb-1.5 text-sm font-medium'>
                    {t('leadForm.key')}
                </p>
                <CodeBlock code={form.key} label={t('leadForm.key')} />
                <p className='text-text-tertiary mt-1.5 text-xs'>
                    {t('leadForm.keyIssued', {
                        date: formatDateTime(form.updated_at),
                    })}{' '}
                    {t('leadForm.keyHint')}
                </p>
            </div>

            <div
                role='group'
                aria-label={t('leadForm.method')}
                className='flex flex-wrap gap-2'
            >
                {METHODS.map((item) => (
                    <button
                        key={item}
                        type='button'
                        aria-pressed={method === item}
                        onClick={() => setMethod(item)}
                        className={cn(
                            'rounded-lg border px-3 py-2 text-sm font-medium transition',
                            method === item
                                ? 'bg-brand-500 border-transparent text-white'
                                : 'border-card-border text-text-secondary hover:text-text-primary',
                        )}
                    >
                        {t(`leadForm.method.${item}`)}
                    </button>
                ))}
            </div>

            {method === 'widget' && <WidgetGuide form={form} />}
            {method === 'html' && <HtmlGuide form={form} />}
            {method === 'tilda' && <TildaGuide form={form} />}

            <p className='text-text-secondary border-card-border border-t pt-4 text-sm'>
                {t('leadForm.whereLeads', {
                    source: t('leadSource.website'),
                    status: t('leadStatus.new'),
                })}{' '}
                <Link
                    href='/leads'
                    className='text-brand-accent font-medium hover:underline'
                >
                    {t('leadForm.openLeads')}
                </Link>
            </p>
        </div>
    );
}

function WidgetGuide({ form }: { form: LeadForm }) {
    const t = useT();
    const { locale } = useLocale();
    const [lang, setLang] = useState<Locale>(locale);
    const [courseId, setCourseId] = useState('');

    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: listCourses,
    });
    const courses = (coursesQuery.data ?? []).filter(
        (course) => course.is_active,
    );

    const snippet = widgetSnippet(form.key, lang, courseId);

    return (
        <div className='flex flex-col gap-4'>
            <Steps
                items={[
                    t('leadForm.widget.step1'),
                    t('leadForm.widget.step2'),
                    t('leadForm.widget.step3'),
                ]}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
                <SelectInput
                    label={t('leadForm.widget.language')}
                    options={LOCALES.map((item) => ({
                        value: item,
                        label: LOCALE_LABELS[item],
                    }))}
                    value={lang}
                    onValueChange={(next) => setLang(next as Locale)}
                />
                <SelectInput
                    label={t('leadForm.widget.course')}
                    options={courses.map((course) => ({
                        value: course.id,
                        label: course.name,
                    }))}
                    placeholder={t('leadForm.widget.anyCourse')}
                    value={courseId}
                    onValueChange={setCourseId}
                />
            </div>
            <CodeBlock code={snippet} />

            <div>
                <p className='text-text-primary mb-2 text-sm font-medium'>
                    {t('leadForm.widget.preview')}
                </p>
                <iframe
                    title={t('leadForm.widget.preview')}
                    srcDoc={previewDocument(snippet)}
                    // Opaque origin: the widget talks to the API like any
                    // outside website would, and cannot touch this page.
                    sandbox='allow-scripts allow-forms'
                    className='border-card-border h-110 w-full rounded-lg border'
                />
                <p className='text-text-tertiary mt-1.5 text-xs'>
                    {t('leadForm.widget.previewHint')}
                </p>
            </div>

            <FieldList
                title={t('leadForm.widget.options')}
                items={[
                    ['data-color', t('leadForm.widget.color')],
                    ['data-title', t('leadForm.widget.titleAttr')],
                    ['data-target', t('leadForm.widget.target')],
                    ['data-source', t('leadForm.widget.source')],
                ]}
            />
            <p className='text-text-tertiary text-xs'>
                {t('leadForm.widget.event', { event: 'edums:lead' })}
            </p>
        </div>
    );
}

function HtmlGuide({ form }: { form: LeadForm }) {
    const t = useT();
    const submitUrl = leadFormSubmitUrl(form.key);

    return (
        <div className='flex flex-col gap-4'>
            <p className='text-text-secondary text-sm'>
                {t('leadForm.html.intro')}
            </p>
            <CodeBlock code={`POST ${submitUrl}`} />

            <FieldList
                title={t('leadForm.html.fields')}
                items={[
                    ['first_name *', t('leadForm.field.firstName')],
                    ['phone_number *', t('leadForm.field.phone')],
                    ['course_id', t('leadForm.field.course')],
                    ['note', t('leadForm.field.note')],
                    ['email', t('leadForm.field.email')],
                    ['source', t('leadForm.field.source')],
                    [
                        'utm_source, utm_medium, utm_campaign',
                        t('leadForm.field.utm'),
                    ],
                    ['website', t('leadForm.field.honeypot')],
                ]}
            />
            <div>
                <p className='text-text-primary mb-1.5 text-sm font-medium'>
                    {t('leadForm.html.courses')}
                </p>
                <CodeBlock code={`GET ${leadFormInfoUrl(form.key)}`} />
            </div>

            <div>
                <p className='text-text-primary mb-1.5 text-sm font-medium'>
                    {t('leadForm.html.example')}
                </p>
                <CodeBlock code={htmlSnippet(submitUrl, t)} />
            </div>

            <FieldList
                title={t('leadForm.html.responses')}
                items={[
                    ['200', t('leadForm.response.ok')],
                    ['400', t('leadForm.response.invalid')],
                    ['404', t('leadForm.response.notFound')],
                    ['429', t('leadForm.response.tooMany')],
                ]}
            />
            <p className='text-text-tertiary text-xs'>
                {t('leadForm.html.duplicates')}
            </p>
        </div>
    );
}

function TildaGuide({ form }: { form: LeadForm }) {
    const t = useT();

    return (
        <div className='flex flex-col gap-4'>
            <Steps
                items={[t('leadForm.tilda.step1'), t('leadForm.tilda.step2')]}
            />
            <CodeBlock code={leadFormSubmitUrl(form.key)} />
            <Steps
                start={3}
                items={[t('leadForm.tilda.step3'), t('leadForm.tilda.step4')]}
            />
            <p className='text-text-tertiary text-xs'>
                {t('leadForm.tilda.https')}
            </p>
            <p className='text-text-secondary text-sm'>
                {t('leadForm.tilda.other')}
            </p>
        </div>
    );
}

function Steps({ items, start = 1 }: { items: string[]; start?: number }) {
    return (
        <ol
            start={start}
            className='text-text-secondary list-decimal space-y-1.5 pl-5 text-sm'
        >
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ol>
    );
}

function FieldList({
    title,
    items,
}: {
    title: string;
    items: Array<[string, string]>;
}) {
    return (
        <div>
            <p className='text-text-primary mb-1.5 text-sm font-medium'>
                {title}
            </p>
            <dl className='border-card-border divide-card-border divide-y rounded-lg border text-sm'>
                {items.map(([name, description]) => (
                    <div
                        key={name}
                        className='grid gap-1 px-3 py-2 sm:grid-cols-[13rem_1fr] sm:gap-3'
                    >
                        <dt className='text-text-primary font-mono text-xs leading-5'>
                            {name}
                        </dt>
                        <dd className='text-text-secondary'>{description}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function widgetSnippet(key: string, lang: Locale, courseId: string): string {
    return [
        '<script',
        `    src="${leadFormScriptUrl()}"`,
        `    data-key="${key}"`,
        `    data-lang="${lang}"`,
        courseId && `    data-course="${courseId}"`,
        '    async',
        '></script>',
    ]
        .filter(Boolean)
        .join('\n');
}

function previewDocument(snippet: string): string {
    return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:2px;font-family:system-ui,sans-serif">${snippet}</body></html>`;
}

/** Oddiy HTML forma — markaz saytining o'z dizayni bilan ishlatish uchun. */
function htmlSnippet(submitUrl: string, t: Translate): string {
    const attr = (text: string) => text.replace(/"/g, '&quot;');
    const js = (text: string) => JSON.stringify(text);

    return `<form id="edums-lead-form">
    <input name="first_name" placeholder="${attr(t('leadForm.html.namePlaceholder'))}" required>
    <input name="phone_number" type="tel" placeholder="+998 90 123 45 67" required>
    <input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px">
    <button type="submit">${attr(t('leadForm.html.submit'))}</button>
</form>
<script>
    document.getElementById('edums-lead-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const response = await fetch('${submitUrl}', {
            method: 'POST',
            body: new URLSearchParams(new FormData(form)),
        });
        if (response.ok) {
            form.reset();
            alert(${js(t('leadForm.html.success'))});
        } else {
            alert(${js(t('leadForm.html.failed'))});
        }
    });
</script>`;
}
