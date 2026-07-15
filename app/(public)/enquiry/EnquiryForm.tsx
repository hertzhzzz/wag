'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, MapPin, Mail, DollarSign, Building2 } from 'lucide-react'
import { KeyboardAwareInput } from './components/KeyboardAwareInput'
import { KeyboardAwareTextarea } from './components/KeyboardAwareTextarea'
import { useT } from '@/i18n/useT'
import { trackFormSubmission, trackSuccessfulEnquiry } from '@/lib/analytics'
import { readSuccessfulEnquiryId } from '@/lib/enquiry-response'
import { buildEnquiryPagePayload, normalizeIndustry } from '@/lib/lead-form-payload'
import {
  isSubmittedPathIntent,
  isTimeline,
  type SubmittedPathIntent,
  type Timeline,
} from '@/lib/enquiry-qualification'

export default function EnquiryForm() {
  const t = useT()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    lookingFor: '',
    pathIntent: '' as '' | SubmittedPathIntent,
    timeline: '' as '' | Timeline,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    const newErrors: Record<string, string> = {}
    if (field === 'fullName' && !formData.fullName.trim()) {
      newErrors.fullName = t('form.enq.field.full_name.error')
    }
    if (field === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = t('form.enq.field.email.error.required')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('form.enq.field.email.error.invalid')
      }
    }
    if (field === 'company') {
      const company = formData.company.trim()
      if (!company) newErrors.company = t('form.enq.field.company.error')
      else if (company.length < 2) newErrors.company = t('form.enq.field.company.error.short')
    }
    if (field === 'lookingFor' && !formData.lookingFor.trim()) {
      newErrors.lookingFor = t('form.enq.field.looking_for.error')
    }
    if (field === 'pathIntent' && !formData.pathIntent) {
      newErrors.pathIntent = t('form.enq.field.path_intent.error')
    }
    if (field === 'timeline' && !formData.timeline) {
      newErrors.timeline = t('form.enq.field.timeline.error')
    }
    setErrors((prev) => ({ ...prev, ...newErrors }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleBlurExtra = (field: string) => {
    setTouched({ ...touched, [field]: true })
  }

  const handlePreFillReport = () => {
    handleChange('lookingFor', t('form.enq.field.looking_for.prefill_text'))
    setTimeout(() => {
      document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => document.getElementById('lookingFor')?.focus(), 400)
    }, 50)
  }

  const validateAll = (): Record<string, string> => {
    const submitErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) submitErrors.fullName = t('form.enq.field.full_name.error')
    if (!formData.email.trim()) submitErrors.email = t('form.enq.field.email.error.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      submitErrors.email = t('form.enq.field.email.error.invalid')
    }
    const company = formData.company.trim()
    if (!company) submitErrors.company = t('form.enq.field.company.error')
    else if (company.length < 2) submitErrors.company = t('form.enq.field.company.error.short')
    if (!formData.pathIntent) submitErrors.pathIntent = t('form.enq.field.path_intent.error')
    if (!formData.timeline) submitErrors.timeline = t('form.enq.field.timeline.error')
    if (!formData.lookingFor.trim()) submitErrors.lookingFor = t('form.enq.field.looking_for.error')
    return submitErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitErrors = validateAll()
    if (Object.keys(submitErrors).length > 0) {
      setErrors(submitErrors)
      setTouched({
        fullName: true,
        email: true,
        company: true,
        pathIntent: true,
        timeline: true,
        lookingFor: true,
      })
      return
    }

    if (!isSubmittedPathIntent(formData.pathIntent) || !isTimeline(formData.timeline)) {
      return
    }

    setSubmitting(true)
    setErrors({})
    const pagePath = '/enquiry'
    const industry = normalizeIndustry(formData.industry)
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildEnquiryPagePayload({
          fullName: formData.fullName,
          email: formData.email,
          company: formData.company,
          lookingFor: formData.lookingFor,
          pathIntent: formData.pathIntent,
          timeline: formData.timeline,
          phone: formData.phone,
        }, {
          sourcePath: pagePath,
          industry: formData.industry,
        })),
      })
      if (res.ok) {
        const enquiryId = await readSuccessfulEnquiryId(res)
        if (enquiryId) {
          trackSuccessfulEnquiry({
            enquiryId,
            formType: 'enquiry_page',
            pagePath,
            industry,
            pathIntent: formData.pathIntent,
            timeline: formData.timeline,
          })
        }
        trackFormSubmission('enquiry_page', pagePath)
        const thankYou = enquiryId
          ? `/enquiry/thank-you?id=${encodeURIComponent(enquiryId)}`
          : '/enquiry/thank-you'
        router.push(thankYou)
      } else {
        const data = await res.json()
        const errorMsg = data.details
          ? Object.values(data.details).flat().join(', ')
          : data.error
        setErrors({ submit: errorMsg || t('form.enq.error.submission_failed') })
      }
    } catch {
      setErrors({ submit: t('form.enq.error.network') })
    } finally {
      setSubmitting(false)
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

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-surface-warm border-b border-gray-200 py-14 sm:py-16 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-navy">{t('page.enq.breadcrumb.home')}</Link>
            <span>›</span>
            <span className="text-navy font-semibold">{t('page.enq.breadcrumb.enquiry')}</span>
          </nav>
          <h1 className="font-serif font-bold text-[clamp(1.75rem,3vw,2.5rem)] text-navy leading-tight mb-3 text-balance">
            {t('page.enq.hero.heading')}
          </h1>
          <p className="text-base text-gray-600 max-w-[560px] text-pretty">
            {t('page.enq.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="flex">
              <div className="bg-white border border-gray-200 rounded-lg p-8 w-full" id="enquiry-form">
                <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase mb-2">{t('form.enq.label.get_in_touch')}</p>
                <h2 className="font-serif font-bold text-[1.375rem] text-navy mb-6">
                  {t('form.enq.label.submit_enquiry')}
                </h2>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-5">
                    <KeyboardAwareInput
                      id="fullName"
                      label={t('form.enq.field.full_name.label')}
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      placeholder={t('form.enq.field.full_name.placeholder')}
                      autoComplete="name"
                      error={touched.fullName ? errors.fullName : undefined}
                    />

                    <KeyboardAwareInput
                      id="email"
                      type="email"
                      label={t('form.enq.field.email.label')}
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder={t('form.enq.field.email.placeholder')}
                      autoComplete="email"
                      error={touched.email ? errors.email : undefined}
                    />

                    <KeyboardAwareInput
                      id="company"
                      label={t('form.enq.field.company.label')}
                      required
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      onBlur={() => handleBlur('company')}
                      placeholder={t('form.enq.field.company.placeholder')}
                      autoComplete="organization"
                      error={touched.company ? errors.company : undefined}
                    />

                    {/* path_intent — two radio cards */}
                    <fieldset>
                      <legend className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        {t('form.enq.field.path_intent.label')} <span className="text-red-500">*</span>
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pathOptions.map((opt) => {
                          const selected = formData.pathIntent === opt.value
                          return (
                            <label
                              key={opt.value}
                              className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                selected ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name="pathIntent"
                                value={opt.value}
                                checked={selected}
                                onChange={() => handleChange('pathIntent', opt.value)}
                                onBlur={() => handleBlur('pathIntent')}
                                className="sr-only"
                              />
                              <span className="block text-sm font-semibold text-navy mb-1">{t(opt.titleKey)}</span>
                              <span className="block text-xs text-gray-500 leading-relaxed">{t(opt.descKey)}</span>
                            </label>
                          )
                        })}
                      </div>
                      {touched.pathIntent && errors.pathIntent && (
                        <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.pathIntent}</p>
                      )}
                    </fieldset>

                    {/* timeline — radio list */}
                    <fieldset>
                      <legend className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        {t('form.enq.field.timeline.label')} <span className="text-red-500">*</span>
                      </legend>
                      <div className="flex flex-col gap-2">
                        {timelineOptions.map((opt) => {
                          const selected = formData.timeline === opt.value
                          return (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-3 cursor-pointer rounded border px-3 py-2.5 transition-colors ${
                                selected ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name="timeline"
                                value={opt.value}
                                checked={selected}
                                onChange={() => handleChange('timeline', opt.value)}
                                onBlur={() => handleBlur('timeline')}
                                className="accent-navy"
                              />
                              <span className="text-sm text-navy">{t(opt.labelKey)}</span>
                            </label>
                          )
                        })}
                      </div>
                      {touched.timeline && errors.timeline && (
                        <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.timeline}</p>
                      )}
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <KeyboardAwareInput
                        id="phone"
                        type="tel"
                        label={t('form.enq.field.phone.label')}
                        optional
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlurExtra('phone')}
                        placeholder={t('form.enq.field.phone.placeholder')}
                        autoComplete="tel"
                      />

                      <div>
                        <label
                          htmlFor="industry"
                          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
                        >
                          {t('form.enq.field.industry.label')}{' '}
                          <span className="text-gray-500 font-normal normal-case tracking-wide lowercase">
                            {t('form.enq.field.industry.optional')}
                          </span>
                        </label>
                        <select
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => handleChange('industry', e.target.value)}
                          onBlur={() => handleBlurExtra('industry')}
                          className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-navy outline-none focus:border-navy transition-colors bg-white"
                        >
                          <option value="">{t('form.enq.field.industry.placeholder')}</option>
                          <option value="av-audio-visual">{t('form.enq.field.industry.av_audio_visual')}</option>
                          <option value="automotive">{t('form.enq.field.industry.automotive')}</option>
                          <option value="agricultural">{t('form.enq.field.industry.agricultural')}</option>
                          <option value="construction">{t('form.enq.field.industry.construction')}</option>
                          <option value="engineering">{t('form.enq.field.industry.engineering')}</option>
                          <option value="electronics">{t('form.enq.field.industry.electronics')}</option>
                          <option value="homewares">{t('form.enq.field.industry.homewares')}</option>
                          <option value="beauty">{t('form.enq.field.industry.beauty')}</option>
                          <option value="fashion">{t('form.enq.field.industry.fashion')}</option>
                          <option value="food-beverage">{t('form.enq.field.industry.food_beverage')}</option>
                          <option value="other">{t('form.enq.field.industry.other')}</option>
                        </select>
                      </div>
                    </div>

                    <KeyboardAwareTextarea
                      id="lookingFor"
                      label={t('form.enq.field.looking_for.label')}
                      required
                      value={formData.lookingFor}
                      onChange={(e) => handleChange('lookingFor', e.target.value)}
                      onBlur={() => handleBlur('lookingFor')}
                      placeholder={t('form.enq.field.looking_for.placeholder')}
                      rows={4}
                      error={touched.lookingFor ? errors.lookingFor : undefined}
                    />

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                        {errors.submit}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      aria-busy={submitting || undefined}
                      className="w-full py-4 md:py-3.5 px-6 bg-navy text-white font-semibold hover:bg-navy-dark active:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 transition-colors duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? t('form.enq.button.submitting') : t('form.enq.button.submit')}
                    </button>

                    <a
                      href="https://calendly.com/mark-winningadventure/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-6 text-sm font-semibold text-navy border border-navy bg-transparent hover:bg-navy hover:text-white active:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 transition-colors duration-200 ease-out text-center mt-3"
                    >
                      {t('form.enq.button.book_call')}
                    </a>
                  </div>
                </form>
              </div>
            </div>

            {/* Right column: engagement mode education + trust */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-serif font-bold text-lg mb-6 text-navy">{t('page.enq.what_happens.heading')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-navy rounded-lg p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center flex-shrink-0">
                        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-navy">{t('page.enq.path1.label')}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {([
                        [t('page.enq.path1.step1.title'), t('page.enq.path1.step1.subtitle')],
                        [t('page.enq.path1.step2.title'), t('page.enq.path1.step2.subtitle')],
                        [t('page.enq.path1.step3.title'), t('page.enq.path1.step3.subtitle')],
                        [t('page.enq.path1.step4.title'), t('page.enq.path1.step4.subtitle')],
                        [t('page.enq.path1.step5.title'), t('page.enq.path1.step5.subtitle')],
                      ] as [string, string][]).map(([title, sub], i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-navy text-amber text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-navy">{title} — </span>
                            <span className="text-xs text-gray-500">{sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-2 border-navy rounded-lg p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center flex-shrink-0">
                        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-navy">{t('page.enq.path2.label')}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {([
                        [t('page.enq.path2.step1.title'), t('page.enq.path2.step1.subtitle')],
                        [t('page.enq.path2.step2.title'), t('page.enq.path2.step2.subtitle')],
                        [t('page.enq.path2.step3.title'), t('page.enq.path2.step3.subtitle')],
                        [t('page.enq.path2.step4.title'), t('page.enq.path2.step4.subtitle')],
                        [t('page.enq.path2.step5.title'), t('page.enq.path2.step5.subtitle')],
                      ] as [string, string][]).map(([title, sub], i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-navy text-amber text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-navy">{title} — </span>
                            <span className="text-xs text-gray-500">{sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-5 border-y border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-navy">{t('page.enq.trust.stat1.value')}</p>
                    <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">{t('page.enq.trust.stat1.label')}</p>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <p className="text-lg font-bold text-navy">{t('page.enq.trust.stat2.value')}</p>
                    <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">{t('page.enq.trust.stat2.label')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-navy">{t('page.enq.trust.stat3.value')}</p>
                    <p className="text-[0.65rem] text-gray-500 uppercase tracking-wider">{t('page.enq.trust.stat3.label')}</p>
                  </div>
                </div>

                <div className="border border-amber/40 rounded-lg px-5 py-4">
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {t('page.enq.promo.text1')}{' '}
                    <span className="font-semibold text-navy">{t('page.enq.promo.highlight')}</span>{' '}
                    {t('page.enq.promo.text2')}{' '}
                    <span className="font-semibold text-amber">{t('page.enq.promo.price')}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={handlePreFillReport}
                    className="block w-full py-2.5 px-4 text-xs font-semibold text-center text-navy border border-navy bg-transparent hover:bg-navy hover:text-white transition-colors duration-200 ease-out"
                  >
                    {t('page.enq.promo.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              <div className="px-6 py-5">
                <p className="text-sm font-semibold text-navy mb-1.5">{t('page.enq.faq.q1')}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t('page.enq.faq.a1')}</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm font-semibold text-navy mb-1.5">{t('page.enq.faq.q2')}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t('page.enq.faq.a2')}</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm font-semibold text-navy mb-1.5">{t('page.enq.faq.q3')}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t('page.enq.faq.a3')}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">{t('page.enq.contact.label')}</p>
              <div className="flex items-start gap-2.5 text-sm text-gray-600 mb-3">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>{t('page.enq.contact.address')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={16} className="flex-shrink-0" />
                <a href="mailto:mark@winningadventure.com.au" className="text-navy font-medium hover:text-amber">
                  {t('page.enq.contact.email')}
                </a>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col justify-center gap-4">
              {([
                [CheckCircle, t('page.enq.trust_badges.verified')],
                [DollarSign, t('page.enq.trust_badges.no_fees')],
                [Building2, t('page.enq.trust_badges.australia_based')],
              ] as [React.ElementType, string][]).map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 text-sm font-semibold text-navy">
                  <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-white" />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
