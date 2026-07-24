'use client'

/**
 * Industry Intent Page qualified intake (C4).
 * Six required qualification fields + optional phone.
 * form_type stays embedded; conversion only after Successful Enquiry.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useEnquiryFunnel } from '@/hooks/useEnquiryFunnel'
import { useT } from '@/i18n/useT'
import { normalizeAnalyticsPagePath, trackFormSubmission, trackSuccessfulEnquiry } from '@/lib/analytics'
import { readSuccessfulEnquiryId } from '@/lib/enquiry-response'
import {
  isSubmittedPathIntent,
  isTimeline,
  type SubmittedPathIntent,
  type Timeline,
} from '@/lib/enquiry-qualification'
import { buildIndustryQualifiedIntake } from '@/lib/industry-qualified-intake'

const CONTACT_EMAIL = 'mark@winningadventure.com.au'

const inputClass =
  'w-full border border-navy/15 bg-white px-4 py-3 text-[15px] text-navy placeholder:text-navy/40 ' +
  'focus:outline-none focus:border-navy focus:ring-2 focus:ring-amber/40 transition-colors'

const labelClass = 'block text-[12px] font-semibold text-navy/70 mb-1.5'

type FormState = {
  fullName: string
  email: string
  company: string
  lookingFor: string
  pathIntent: '' | SubmittedPathIntent
  timeline: '' | Timeline
  phone: string
}

export default function IndustryQualifiedLeadForm({
  id,
  industry,
  heading,
  subcopy,
  cta,
}: {
  id?: string
  /** Industry attribution slug from the page (e.g. av-lighting). */
  industry: string
  heading?: string
  subcopy?: string
  cta?: string
}) {
  const t = useT()
  const router = useRouter()
  const actualHeading = heading ?? t('form.industry.defaultHeading')
  const actualSubcopy = subcopy ?? t('form.industry.defaultSubcopy')
  const actualCta = cta ?? buildIndustryQualifiedIntake.defaultCta

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    company: '',
    lookingFor: '',
    pathIntent: '',
    timeline: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const pagePath = typeof window !== 'undefined'
    ? normalizeAnalyticsPagePath(window.location.pathname)
    : normalizeAnalyticsPagePath(`/industries/${industry}`)
  const funnel = useEnquiryFunnel({
    sourcePath: pagePath,
    formSurface: 'embedded_industry',
    formVersion: 'legacy_baseline',
    industry,
  })

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    const nextForm = { ...form, [field]: value }
    if (field === 'pathIntent') funnel.start()
    if (
      (field === 'pathIntent' || field === 'timeline')
      && isSubmittedPathIntent(nextForm.pathIntent)
      && isTimeline(nextForm.timeline)
    ) {
      funnel.stepComplete({
        pathIntent: nextForm.pathIntent,
        timeline: nextForm.timeline,
      })
    }
    setForm(nextForm)
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {}
    if (!form.fullName.trim()) next.fullName = t('form.enq.field.full_name.error')
    if (!form.email.trim()) next.email = t('form.enq.field.email.error.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t('form.enq.field.email.error.invalid')
    }
    const company = form.company.trim()
    if (!company) next.company = t('form.enq.field.company.error')
    else if (company.length < 2) next.company = t('form.enq.field.company.error.short')
    if (!form.pathIntent) next.pathIntent = t('form.enq.field.path_intent.error')
    if (!form.timeline) next.timeline = t('form.enq.field.timeline.error')
    if (!form.lookingFor.trim()) next.lookingFor = t('form.enq.field.looking_for.error')
    return next
  }

  const trackFirstValidationError = (validationErrors: Record<string, string>) => {
    if (validationErrors.fullName) {
      funnel.error({ step: 'submission', fieldKey: 'full_name', errorType: 'required' })
    } else if (validationErrors.email) {
      funnel.error({
        step: 'submission',
        fieldKey: 'email',
        errorType: form.email.trim() ? 'invalid_format' : 'required',
      })
    } else if (validationErrors.company) {
      funnel.error({
        step: 'submission',
        fieldKey: 'company',
        errorType: form.company.trim() ? 'too_short' : 'required',
      })
    } else if (validationErrors.pathIntent) {
      funnel.error({ step: 'qualification', fieldKey: 'path_intent', errorType: 'required' })
    } else if (validationErrors.timeline) {
      funnel.error({ step: 'qualification', fieldKey: 'timeline', errorType: 'required' })
    } else if (validationErrors.lookingFor) {
      funnel.error({ step: 'submission', fieldKey: 'looking_for', errorType: 'required' })
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      trackFirstValidationError(validationErrors)
      setErrors(validationErrors)
      return
    }
    if (!isSubmittedPathIntent(form.pathIntent) || !isTimeline(form.timeline)) {
      return
    }

    setStatus('submitting')
    setErrors({})
    let responseFailureTracked = false

    try {
      const intake = buildIndustryQualifiedIntake({
        fullName: form.fullName,
        email: form.email,
        company: form.company,
        lookingFor: form.lookingFor,
        pathIntent: form.pathIntent,
        timeline: form.timeline,
        phone: form.phone,
      }, {
        sourcePath: pagePath,
        industry,
      })

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake.requestBody),
      })
      if (!res.ok) {
        responseFailureTracked = true
        funnel.error({
          step: 'submission',
          fieldKey: 'form',
          errorType: res.status === 429 ? 'rate_limited' : 'server',
        })
        throw new Error('submit_failed')
      }

      const enquiryId = await readSuccessfulEnquiryId(res)
      if (enquiryId) {
        trackSuccessfulEnquiry({
          enquiryId,
          ...intake.conversion,
        })
      }
      trackFormSubmission('embedded', pagePath)

      const thankYou = enquiryId
        ? `/enquiry/thank-you?id=${encodeURIComponent(enquiryId)}`
        : '/enquiry/thank-you'
      router.push(thankYou)
    } catch {
      if (!responseFailureTracked) {
        funnel.error({ step: 'submission', fieldKey: 'form', errorType: 'network' })
      }
      setStatus('error')
      setErrors({ submit: t('form.lead.errorText') })
    }
  }

  const pathOptions: { value: SubmittedPathIntent; titleKey: 'form.enq.field.path_intent.find_new.title' | 'form.enq.field.path_intent.verify_existing.title'; descKey: 'form.enq.field.path_intent.find_new.desc' | 'form.enq.field.path_intent.verify_existing.desc' }[] = [
    {
      value: 'find_new',
      titleKey: 'form.enq.field.path_intent.find_new.title',
      descKey: 'form.enq.field.path_intent.find_new.desc',
    },
    {
      value: 'verify_existing',
      titleKey: 'form.enq.field.path_intent.verify_existing.title',
      descKey: 'form.enq.field.path_intent.verify_existing.desc',
    },
  ]

  const timelineOptions: { value: Timeline; labelKey: 'form.enq.field.timeline.0_3' | 'form.enq.field.timeline.3_6' | 'form.enq.field.timeline.6plus' | 'form.enq.field.timeline.exploring' }[] = [
    { value: '0-3_months', labelKey: 'form.enq.field.timeline.0_3' },
    { value: '3-6_months', labelKey: 'form.enq.field.timeline.3_6' },
    { value: '6plus_months', labelKey: 'form.enq.field.timeline.6plus' },
    { value: 'exploring', labelKey: 'form.enq.field.timeline.exploring' },
  ]

  const fieldId = (name: string) => `${id ?? 'iqf'}-${name}`

  return (
    <form
      ref={funnel.formRef}
      id={id}
      onSubmit={submit}
      noValidate
      className="bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,45,94,0.18)]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldCheck size={18} className="text-amber" aria-hidden="true" />
        <p className="font-serif font-bold text-navy text-xl leading-tight">{actualHeading}</p>
      </div>
      <p className="text-navy/70 text-[13px] leading-relaxed mb-6">{actualSubcopy}</p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={fieldId('name')} className={labelClass}>
            {t('form.enq.field.full_name.label')}
          </label>
          <input
            id={fieldId('name')}
            type="text"
            autoComplete="name"
            placeholder={t('form.enq.field.full_name.placeholder')}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            className={inputClass}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('email')} className={labelClass}>
            {t('form.enq.field.email.label')}
          </label>
          <input
            id={fieldId('email')}
            type="email"
            autoComplete="email"
            placeholder={t('form.enq.field.email.placeholder')}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('company')} className={labelClass}>
            {t('form.enq.field.company.label')}
          </label>
          <input
            id={fieldId('company')}
            type="text"
            autoComplete="organization"
            placeholder={t('form.enq.field.company.placeholder')}
            value={form.company}
            onChange={(e) => setField('company', e.target.value)}
            className={inputClass}
          />
          {errors.company && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.company}</p>
          )}
        </div>

        <fieldset>
          <legend className={labelClass}>{t('form.enq.field.path_intent.label')}</legend>
          <div className="grid grid-cols-1 gap-2">
            {pathOptions.map((opt) => {
              const selected = form.pathIntent === opt.value
              return (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded border-2 p-3 transition-colors ${
                    selected ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id ?? 'iqf'}-pathIntent`}
                    value={opt.value}
                    checked={selected}
                    onChange={() => setField('pathIntent', opt.value)}
                    className="sr-only"
                  />
                  <span className="block text-[13px] font-semibold text-navy mb-0.5">{t(opt.titleKey)}</span>
                  <span className="block text-[12px] text-navy/60 leading-relaxed">{t(opt.descKey)}</span>
                </label>
              )
            })}
          </div>
          {errors.pathIntent && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.pathIntent}</p>
          )}
        </fieldset>

        <fieldset>
          <legend className={labelClass}>{t('form.enq.field.timeline.label')}</legend>
          <div className="flex flex-col gap-2">
            {timelineOptions.map((opt) => {
              const selected = form.timeline === opt.value
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer rounded border px-3 py-2.5 transition-colors ${
                    selected ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id ?? 'iqf'}-timeline`}
                    value={opt.value}
                    checked={selected}
                    onChange={() => setField('timeline', opt.value)}
                    className="accent-navy"
                  />
                  <span className="text-[13px] text-navy">{t(opt.labelKey)}</span>
                </label>
              )
            })}
          </div>
          {errors.timeline && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.timeline}</p>
          )}
        </fieldset>

        <div>
          <label htmlFor={fieldId('phone')} className={labelClass}>
            {t('form.enq.field.phone.label')}{' '}
            <span className="font-normal text-navy/50">{t('form.enq.field.industry.optional')}</span>
          </label>
          <input
            id={fieldId('phone')}
            type="tel"
            autoComplete="tel"
            placeholder={t('form.enq.field.phone.placeholder')}
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={fieldId('need')} className={labelClass}>
            {t('form.enq.field.looking_for.label')}
          </label>
          <textarea
            id={fieldId('need')}
            rows={3}
            placeholder={t('form.enq.field.looking_for.placeholder')}
            value={form.lookingFor}
            onChange={(e) => setField('lookingFor', e.target.value)}
            className={`${inputClass} resize-none`}
          />
          {errors.lookingFor && (
            <p className="mt-1.5 text-[12px] text-red-600" role="alert">{errors.lookingFor}</p>
          )}
        </div>

        {(status === 'error' || errors.submit) && (
          <p className="text-[13px] text-red-600 leading-relaxed" role="alert">
            {errors.submit ? `${errors.submit} ` : `${t('form.lead.errorText')} `}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          aria-busy={status === 'submitting' || undefined}
          className="w-full bg-amber text-navy font-semibold py-3.5 hover:bg-navy hover:text-white transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? t('form.lead.submitting') : actualCta}
        </button>
        <p className="text-navy/50 text-[11px] text-center">
          {t('form.lead.privacy')}
        </p>
      </div>
    </form>
  )
}
