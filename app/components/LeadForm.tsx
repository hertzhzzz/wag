'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useEnquiryFunnel } from '@/hooks/useEnquiryFunnel'
import { useT } from '@/i18n/useT'
import { normalizeAnalyticsPagePath, trackFormSubmission, trackSuccessfulEnquiry } from '@/lib/analytics'
import type { EnquiryFormFieldKey } from '@/lib/analytics'
import { readSuccessfulEnquiryId } from '@/lib/enquiry-response'
import { buildLeadFormPayload, normalizeIndustry } from '@/lib/lead-form-payload'
import { buildIndustryQualifiedIntake } from '@/lib/industry-qualified-intake'
import {
  isSubmittedPathIntent,
  isTimeline,
  type BudgetRange,
  type OrderType,
  type SubmittedPathIntent,
  type Timeline,
} from '@/lib/enquiry-qualification'
import { BUDGET_OPTIONS, ORDER_TYPE_OPTIONS, PATH_INTENT_OPTIONS, TIMELINE_OPTIONS } from './enquiry-options'

// Shared lead capture form: 7 required fields → POST /api/enquiry
// industry prop is attribution slug only (never a service name)
// qualify prop adds path-intent + timeline qualification fields (Industry Intent Page use case)
const CONTACT_EMAIL = 'mark@winningadventure.com.au'

const inputClass =
  'w-full border border-navy/15 bg-white px-4 py-2.5 text-[15px] text-navy placeholder:text-navy/40 ' +
  'focus:outline-none focus:border-navy focus:ring-2 focus:ring-amber/40 transition-colors'

const labelClass = 'block text-[12px] font-semibold text-navy/70 mb-1'

const errorClass = 'mt-1.5 text-[12px] text-red-600'

type FormState = {
  fullName: string
  email: string
  phone: string
  company: string
  budget: '' | BudgetRange
  orderType: '' | OrderType
  pathIntent: '' | SubmittedPathIntent
  timeline: '' | Timeline
  lookingFor: string
}

const EMPTY_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  budget: '',
  orderType: '',
  pathIntent: '',
  timeline: '',
  lookingFor: '',
}

// Validation order doubles as the focus order for the first invalid field.
const FIELD_ORDER: (keyof FormState)[] = [
  'fullName',
  'email',
  'phone',
  'company',
  'budget',
  'orderType',
  'pathIntent',
  'timeline',
  'lookingFor',
]

const FIELD_KEYS: Record<keyof FormState, EnquiryFormFieldKey> = {
  fullName: 'full_name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  budget: 'budget',
  orderType: 'order_type',
  pathIntent: 'path_intent',
  timeline: 'timeline',
  lookingFor: 'looking_for',
}

export default function LeadForm({
  id,
  heading,
  subcopy,
  cta,
  industry,
  qualify,
}: {
  id?: string
  heading?: string
  subcopy?: string
  cta?: string
  /** Industry attribution slug (e.g. av-lighting). Omit on non-industry pages. */
  industry?: string
  /** Ask the two qualification questions (path intent + timeline). */
  qualify?: boolean
}) {
  const t = useT()
  const router = useRouter()
  const actualHeading = heading ?? t(qualify ? 'form.industry.defaultHeading' : 'form.lead.defaultHeading')
  const actualSubcopy = subcopy ?? t(qualify ? 'form.industry.defaultSubcopy' : 'form.lead.defaultSubcopy')
  const actualCta = cta ?? (qualify ? buildIndustryQualifiedIntake.defaultCta : t('form.lead.submit'))
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'submit', string>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  // Synchronous guard: React state updates are async, so `disabled` alone
  // cannot stop a fast double-click from firing two requests.
  const inFlightRef = useRef(false)
  const pagePath = typeof window !== 'undefined'
    ? normalizeAnalyticsPagePath(window.location.pathname)
    : 'not_provided'
  const funnel = useEnquiryFunnel({
    sourcePath: pagePath,
    formSurface: industry ? 'embedded_industry' : 'embedded_general',
    formVersion: 'legacy_baseline',
    industry,
  })

  const fieldId = (name: string) => `${id ?? 'lf'}-${name}`

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    funnel.start()
    const nextForm = { ...form, [field]: value }
    if (
      qualify
      && (field === 'pathIntent' || field === 'timeline')
      && isSubmittedPathIntent(nextForm.pathIntent)
      && isTimeline(nextForm.timeline)
    ) {
      funnel.stepComplete({ pathIntent: nextForm.pathIntent, timeline: nextForm.timeline })
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

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.fullName.trim()) next.fullName = t('form.enq.field.full_name.error')
    if (!form.email.trim()) next.email = t('form.enq.field.email.error.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t('form.enq.field.email.error.invalid')
    }
    if (!form.phone.trim()) next.phone = t('form.enq.field.phone.error')
    const company = form.company.trim()
    if (!company) next.company = t('form.enq.field.company.error')
    else if (company.length < 2) next.company = t('form.enq.field.company.error.short')
    if (!form.budget) next.budget = t('form.enq.field.budget.error')
    if (!form.orderType) next.orderType = t('form.enq.field.order_type.error')
    if (qualify) {
      if (!form.pathIntent) next.pathIntent = t('form.enq.field.path_intent.error')
      if (!form.timeline) next.timeline = t('form.enq.field.timeline.error')
    }
    if (!form.lookingFor.trim()) next.lookingFor = t('form.enq.field.looking_for.error')
    return next
  }

  /** Report the first invalid field and move focus (or scroll) to it. */
  const handleValidationErrors = (validationErrors: Partial<Record<keyof FormState, string>>) => {
    const firstInvalid = FIELD_ORDER.find((field) => validationErrors[field])
    if (!firstInvalid) return
    const errorType = firstInvalid === 'email' && form.email.trim()
      ? 'invalid_format'
      : firstInvalid === 'company' && form.company.trim()
        ? 'too_short'
        : 'required'
    funnel.error({ step: 'legacy', fieldKey: FIELD_KEYS[firstInvalid], errorType })
    if (typeof document === 'undefined') return
    const target = document.getElementById(fieldId(firstInvalid))
    if (!target) return
    // Radio-group fieldsets have no single input to focus — scroll to them instead.
    if (firstInvalid === 'pathIntent' || firstInvalid === 'timeline') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      target.focus()
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inFlightRef.current) return

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      handleValidationErrors(validationErrors)
      return
    }
    // Narrowed by validate(): both selects are non-empty past this point.
    if (!form.budget || !form.orderType) return
    if (qualify && (!isSubmittedPathIntent(form.pathIntent) || !isTimeline(form.timeline))) return

    inFlightRef.current = true
    setStatus('submitting')
    setErrors({})
    let responseFailureTracked = false
    try {
      let requestBody: unknown
      let conversion: Omit<Parameters<typeof trackSuccessfulEnquiry>[0], 'enquiryId'>

      if (qualify && isSubmittedPathIntent(form.pathIntent) && isTimeline(form.timeline)) {
        const intake = buildIndustryQualifiedIntake({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          company: form.company,
          budget: form.budget,
          orderType: form.orderType,
          lookingFor: form.lookingFor,
          pathIntent: form.pathIntent,
          timeline: form.timeline,
        }, {
          sourcePath: pagePath,
          industry: industry ?? '',
        })
        requestBody = intake.requestBody
        conversion = intake.conversion
      } else {
        requestBody = buildLeadFormPayload({
          ...form,
          budget: form.budget,
          orderType: form.orderType,
        }, {
          sourcePath: pagePath,
          industry,
        })
        conversion = {
          formType: 'embedded',
          pagePath,
          industry: normalizeIndustry(industry),
          pathIntent: 'not_provided',
        }
      }

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
        trackSuccessfulEnquiry({ enquiryId, ...conversion })
      }
      trackFormSubmission('embedded', pagePath)
      router.push(enquiryId ? `/enquiry/thank-you?id=${encodeURIComponent(enquiryId)}` : '/enquiry/thank-you')
    } catch {
      if (!responseFailureTracked) {
        funnel.error({ step: 'submission', fieldKey: 'form', errorType: 'network' })
      }
      setErrors({ submit: t('form.lead.errorText') })
    } finally {
      inFlightRef.current = false
      setStatus((prev) => (prev === 'submitting' ? 'idle' : prev))
    }
  }

  const renderError = (field: keyof FormState) => (
    errors[field]
      ? <p className={errorClass} role="alert">{errors[field]}</p>
      : null
  )

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

      <div className="flex flex-col gap-3">
        {/* Row 1 — name + email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={fieldId('fullName')} className={labelClass}>
              {t('form.lead.labelName')}
            </label>
            <input
              id={fieldId('fullName')}
              type="text"
              autoComplete="name"
              placeholder={t('form.lead.placeholderName')}
              value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              className={inputClass}
            />
            {renderError('fullName')}
          </div>
          <div>
            <label htmlFor={fieldId('email')} className={labelClass}>
              {t('form.lead.labelEmail')}
            </label>
            <input
              id={fieldId('email')}
              type="email"
              autoComplete="email"
              placeholder={t('form.lead.placeholderEmail')}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={inputClass}
            />
            {renderError('email')}
          </div>
        </div>

        {/* Row 2 — phone + company */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={fieldId('phone')} className={labelClass}>
              {t('form.lead.labelPhone')}
            </label>
            <input
              id={fieldId('phone')}
              type="tel"
              autoComplete="tel"
              placeholder={t('form.lead.placeholderPhone')}
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              className={inputClass}
            />
            {renderError('phone')}
          </div>
          <div>
            <label htmlFor={fieldId('company')} className={labelClass}>
              {t('form.lead.labelCompany')}
            </label>
            <input
              id={fieldId('company')}
              type="text"
              autoComplete="organization"
              placeholder={t('form.lead.placeholderCompany')}
              value={form.company}
              onChange={(e) => setField('company', e.target.value)}
              className={inputClass}
            />
            {renderError('company')}
          </div>
        </div>

        {/* Row 3 — budget + order type. Stays two-up on mobile to hold the card height. */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={fieldId('budget')} className={labelClass}>
              {t('form.lead.labelBudget')}
            </label>
            <select
              id={fieldId('budget')}
              value={form.budget}
              onChange={(e) => setField('budget', e.target.value as BudgetRange)}
              className={inputClass}
            >
              <option value="">{t('form.lead.selectPlaceholder')}</option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
            {renderError('budget')}
          </div>
          <div>
            <label htmlFor={fieldId('orderType')} className={labelClass}>
              {t('form.lead.labelOrderType')}
            </label>
            <select
              id={fieldId('orderType')}
              value={form.orderType}
              onChange={(e) => setField('orderType', e.target.value as OrderType)}
              className={inputClass}
            >
              <option value="">{t('form.lead.selectPlaceholder')}</option>
              {ORDER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
            {renderError('orderType')}
          </div>
        </div>

        {qualify && (
          <>
            <fieldset id={fieldId('pathIntent')}>
              <legend className={labelClass}>{t('form.enq.field.path_intent.label')}</legend>
              <div className="grid grid-cols-1 gap-2">
                {PATH_INTENT_OPTIONS.map((opt) => {
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
                        name={`${id ?? 'lf'}-pathIntent`}
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
              {renderError('pathIntent')}
            </fieldset>

            <fieldset id={fieldId('timeline')}>
              <legend className={labelClass}>{t('form.enq.field.timeline.label')}</legend>
              <div className="flex flex-col gap-2">
                {TIMELINE_OPTIONS.map((opt) => {
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
                        name={`${id ?? 'lf'}-timeline`}
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
              {renderError('timeline')}
            </fieldset>
          </>
        )}

        {/* Row 4 — brief */}
        <div>
          <label htmlFor={fieldId('lookingFor')} className={labelClass}>
            {t('form.lead.labelNeed')}
          </label>
          <textarea
            id={fieldId('lookingFor')}
            rows={2}
            placeholder={t('form.lead.placeholderNeed')}
            value={form.lookingFor}
            onChange={(e) => setField('lookingFor', e.target.value)}
            className={`${inputClass} resize-none`}
          />
          {renderError('lookingFor')}
        </div>

        {errors.submit && (
          <p className="text-[13px] text-red-600 leading-relaxed" role="alert">
            {errors.submit}{' '}
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
          className="w-full bg-amber text-navy font-semibold py-3.5 min-h-11 hover:bg-navy hover:text-white transition-colors disabled:opacity-60"
          aria-label={actualCta}
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
