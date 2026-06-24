'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircleReply, X, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FloatingEnquiryWidgetProps {
  className?: string
}

export function FloatingEnquiryWidget({ className = '' }: FloatingEnquiryWidgetProps) {
  const pathname = usePathname()
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', lookingFor: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  // Initialize to an impossible value so first real pathname always differs
  // (kept for future re-enablement of auto-open feature)
  const lastPathname = useRef<string | null>(null)
  const animationKey = useRef(0)

  // Auto-open on article pages — disabled
  // Previously: auto-opened panel when pathname started with /article/
  // Removed to prevent disrupting the reading flow on blog article pages.
  // User must manually click the trigger button to open the enquiry panel.
  // useEffect(() => {
  //   const isArticle = pathname && pathname.startsWith('/article/') && pathname !== '/article'
  //   if (isArticle && lastPathname.current !== pathname) {
  //     animationKey.current += 1
  //     setIsPanelVisible(true)
  //     setIsDismissed(false)
  //     lastPathname.current = pathname
  //   } else {
  //     lastPathname.current = pathname || null
  //     setIsPanelVisible(false)
  //     setIsDismissed(false)
  //   }
  // }, [pathname])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isPanelVisible && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPanelVisible(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isPanelVisible])

  const handleClose = () => {
    setIsPanelVisible(false)
    setIsDismissed(true)
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    const newErrors: Record<string, string> = {}
    if (field === 'fullName' && !form.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (field === 'email') {
      if (!form.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email'
    }
    if (field === 'lookingFor' && !form.lookingFor.trim()) newErrors.lookingFor = 'Please describe what you need'
    setErrors(prev => ({ ...prev, ...newErrors }))
  }

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitErrors: Record<string, string> = {}
    if (!form.fullName.trim()) submitErrors.fullName = 'Full name is required'
    if (!form.email.trim()) submitErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) submitErrors.email = 'Please enter a valid email'
    if (!form.lookingFor.trim()) submitErrors.lookingFor = 'Please describe what you need'
    if (Object.keys(submitErrors).length > 0) {
      setErrors(submitErrors)
      setTouched({ fullName: true, email: true, lookingFor: true })
      return
    }

    // Google Ads conversion fires on submit click
    const _win = window as Window & { fbq?: Function; gtag?: Function }
    if (_win.gtag) {
      _win.gtag('event', 'conversion', {
        send_to: 'AW-18216448449/6Uh5CLv_z8QcEMHjo-5D',
        value: 1.0,
        currency: 'AUD',
      })
    }

    setLoading(true)
    setErrors({})
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        // GA4 + Meta Pixel fire after API confirms success
        setTimeout(() => {
          const win = window as Window & { fbq?: Function; gtag?: Function }
          if (win.gtag) {
            win.gtag('event', 'generate_lead', {
              event_category: 'enquiry',
              event_label: 'floating_widget',
              value: 1,
              currency: 'AUD',
            })
          }
          if (win.fbq) {
            win.fbq('track', 'Lead', {
              content_name: 'Enquiry Form Submission (Widget)',
              currency: 'AUD',
            })
          }
        }, 100)
      } else {
        const data = await res.json()
        setErrors({ submit: data.error || 'Submission failed. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleManualToggle = () => {
    if (isPanelVisible) {
      handleClose()
    } else {
      setIsDismissed(false)
      animationKey.current += 1
      setIsPanelVisible(true)
    }
  }

  // Hide on client portal, factory wiki, and admin pages
  if (pathname?.startsWith("/client") || pathname?.startsWith("/factory")) {
    return null
  }

  return (
    <div ref={containerRef} className={`fixed bottom-6 right-6 z-[9998] ${className}`}>

      {isPanelVisible && (
        <div
          key={animationKey.current}
          className="widget-open absolute bottom-full right-0 mb-2 w-[420px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0F2D5E] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <MessageCircleReply size={16} className="text-white" />
                </div>
                <h3 className="font-serif font-bold text-white text-sm leading-tight">
                  Free China Factory Tour Consult
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-white/50 text-xs mt-1 ml-10">We respond within 4 business hours</p>
          </div>

          {/* Body */}
          <div className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[#0F2D5E] rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={28} className="text-[#F59E0B]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-2">Your Enquiry Is In Our Hands</h3>
                <p className="text-gray-500 text-sm mb-6">We&apos;ll review your requirements and reach out within 4 business hours.</p>
                <Link
                  href="/"
                  onClick={() => { setSubmitted(false); setForm({ fullName: '', email: '', phone: '', lookingFor: '' }); handleClose() }}
                  className="px-5 py-2.5 bg-[#0F2D5E] text-white text-sm font-semibold hover:bg-[#0a2148] transition-colors inline-block"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <label htmlFor="widget-fullName" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="widget-fullName"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] placeholder:text-gray-300 focus:outline-none focus:border-[#0F2D5E] transition-colors bg-white ${
                      touched.fullName && errors.fullName ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="widget-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="widget-email"
                    type="email"
                    placeholder="jane@company.com.au"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] placeholder:text-gray-300 focus:outline-none focus:border-[#0F2D5E] transition-colors bg-white ${
                      touched.email && errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="widget-phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Phone <span className="text-gray-400 font-normal normal-case tracking-wide lowercase">(optional)</span>
                  </label>
                  <input
                    id="widget-phone"
                    type="tel"
                    placeholder="+61 4xx xxx xxx"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-[#0F2D5E] placeholder:text-gray-300 focus:outline-none focus:border-[#0F2D5E] transition-colors bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="widget-lookingFor" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    What do you need? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="widget-lookingFor"
                    placeholder="Describe your product, quantity, quality requirements..."
                    rows={3}
                    value={form.lookingFor}
                    onChange={e => handleChange('lookingFor', e.target.value)}
                    onBlur={() => handleBlur('lookingFor')}
                    className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] placeholder:text-gray-300 focus:outline-none focus:border-[#0F2D5E] transition-colors bg-white resize-none ${
                      touched.lookingFor && errors.lookingFor ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {touched.lookingFor && errors.lookingFor && (
                    <p className="mt-1 text-xs text-red-500">{errors.lookingFor}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#0F2D5E] text-white font-semibold hover:bg-[#0a2148] active:bg-[#071a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Plan My Factory Visit →'
                  )}
                </button>

                <a
                  href="https://calendly.com/mark-winningadventure/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[#0F2D5E] hover:text-[#F59E0B] mt-0.5"
                >
                  Prefer to talk? Book a call →
                </a>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Trigger Button */}
      <button
        onClick={handleManualToggle}
        aria-label={isPanelVisible ? 'Close enquiry form' : 'Open enquiry form'}
        className={`
          group relative flex items-center gap-2.5 px-5 py-3.5
          ${isPanelVisible
            ? 'bg-[#0F2D5E] text-white'
            : 'bg-[#F59E0B] text-[#0F2D5E] hover:bg-[#FBBF24]'
          }
          rounded-full shadow-lg hover:shadow-xl transition-all duration-200
          hover:scale-105 active:scale-95
        `}
      >
        {!isPanelVisible && (
          <span className="absolute inset-0 rounded-full animate-pulse-ring bg-[#F59E0B]" />
        )}

        <MessageCircleReply size={20} className="relative z-10" />
        <span className="relative z-10 font-semibold text-sm hidden sm:inline">Enquire Now</span>

        {isPanelVisible && <X size={18} />}
      </button>
    </div>
  )
}