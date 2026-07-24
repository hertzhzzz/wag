'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useEnquiryFunnel } from '@/hooks/useEnquiryFunnel'
import { useT } from '@/i18n/useT'
import { normalizeAnalyticsPagePath, trackFormSubmission, trackSuccessfulEnquiry } from '@/lib/analytics'
import { readSuccessfulEnquiryId } from '@/lib/enquiry-response'
import { buildLeadFormPayload, normalizeIndustry } from '@/lib/lead-form-payload'

// Shared lead capture form: 3 fields (name/email/need) → POST /api/enquiry
// industry prop is attribution slug only (never a service name)
const CONTACT_EMAIL = 'mark@winningadventure.com.au'

const inputClass =
  'w-full border border-navy/15 bg-white px-4 py-3 text-[15px] text-navy placeholder:text-navy/40 ' +
  'focus:outline-none focus:border-navy focus:ring-2 focus:ring-amber/40 transition-colors'

const labelClass = 'block text-[12px] font-semibold text-navy/70 mb-1.5'

export default function LeadForm({
  id,
  heading,
  subcopy,
  cta,
  industry,
}: {
  id?: string
  heading?: string
  subcopy?: string
  cta?: string
  /** Industry attribution slug (e.g. av-lighting). Omit on non-industry pages. */
  industry?: string
}) {
  const t = useT()
  const actualHeading = heading ?? t('form.lead.defaultHeading')
  const actualSubcopy = subcopy ?? t('form.lead.defaultSubcopy')
  const [form, setForm] = useState({ fullName: '', email: '', lookingFor: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const pagePath = typeof window !== 'undefined'
    ? normalizeAnalyticsPagePath(window.location.pathname)
    : 'not_provided'
  const funnel = useEnquiryFunnel({
    sourcePath: pagePath,
    formSurface: 'embedded_general',
    formVersion: 'legacy_baseline',
    industry,
  })

  const setField = (field: 'fullName' | 'email' | 'lookingFor', value: string) => {
    funnel.start()
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missingField = !form.fullName.trim()
      ? 'full_name'
      : !form.email.trim()
        ? 'email'
        : !form.lookingFor.trim()
          ? 'looking_for'
          : null
    if (missingField) {
      funnel.error({ step: 'legacy', fieldKey: missingField, errorType: 'required' })
      setStatus('error')
      return
    }
    setStatus('submitting')
    let responseFailureTracked = false
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildLeadFormPayload(form, {
          sourcePath: pagePath,
          industry,
        })),
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
          formType: 'embedded',
          pagePath,
          industry: normalizeIndustry(industry),
          pathIntent: 'not_provided',
        })
      }
      trackFormSubmission('embedded', pagePath)
      setStatus('success')
    } catch {
      if (!responseFailureTracked) {
        funnel.error({ step: 'submission', fieldKey: 'form', errorType: 'network' })
      }
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div id={id} className="bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,45,94,0.18)]">
        <CheckCircle2 size={40} className="text-amber mx-auto mb-4" />
        <p className="font-serif font-bold text-navy text-xl mb-2">{t('form.lead.successTitle')}</p>
        <p className="text-navy/70 text-[15px] leading-relaxed">
          {t('form.lead.successBody')}
        </p>
      </div>
    )
  }

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
          <label htmlFor={`${id ?? 'lf'}-name`} className={labelClass}>
            {t('form.lead.labelName')}
          </label>
          <input
            id={`${id ?? 'lf'}-name`}
            type="text"
            autoComplete="name"
            placeholder={t('form.lead.placeholderName')}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id ?? 'lf'}-email`} className={labelClass}>
            {t('form.lead.labelEmail')}
          </label>
          <input
            id={`${id ?? 'lf'}-email`}
            type="email"
            autoComplete="email"
            placeholder={t('form.lead.placeholderEmail')}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id ?? 'lf'}-need`} className={labelClass}>
            {t('form.lead.labelNeed')}
          </label>
          <textarea
            id={`${id ?? 'lf'}-need`}
            rows={3}
            placeholder={t('form.lead.placeholderNeed')}
            value={form.lookingFor}
            onChange={(e) => setField('lookingFor', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {status === 'error' && (
          <p className="text-[13px] text-red-600 leading-relaxed" role="alert">
            {t('form.lead.errorText')}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-amber text-navy font-semibold py-3.5 min-h-11 hover:bg-navy hover:text-white transition-colors disabled:opacity-60"
          aria-label={cta ?? t('form.lead.submit')}
        >
          {status === 'submitting' ? t('form.lead.submitting') : (cta ?? t('form.lead.submit'))}
        </button>
        <p className="text-navy/50 text-[11px] text-center">
          {t('form.lead.privacy')}
        </p>
      </div>
    </form>
  )
}
