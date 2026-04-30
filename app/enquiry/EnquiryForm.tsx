'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, MapPin, Mail, DollarSign, Building2 } from 'lucide-react'
import { KeyboardAwareInput } from './components/KeyboardAwareInput'
import { KeyboardAwareTextarea } from './components/KeyboardAwareTextarea'

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '', industry: '', lookingFor: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    const newErrors: Record<string, string> = {}
    if (field === 'fullName' && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (field === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
    }
    if (field === 'lookingFor' && !formData.lookingFor.trim()) {
      newErrors.lookingFor = 'Please describe what you need'
    }
    setErrors((prev) => ({ ...prev, ...newErrors }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  // Blur validation for new fields
  const handleBlurExtra = (field: string) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) submitErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) submitErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) submitErrors.email = 'Please enter a valid email'
    if (!formData.lookingFor.trim()) submitErrors.lookingFor = 'Please describe what you need'
    if (Object.keys(submitErrors).length > 0) {
      setErrors(submitErrors)
      setTouched({ fullName: true, email: true, lookingFor: true })
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        const errorMsg = data.details
          ? Object.values(data.details).flat().join(', ')
          : data.error
        setErrors({ submit: errorMsg || 'Submission failed. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#f8f9fb] border-b border-gray-200 py-12 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-[#0F2D5E]">Home</Link>
            <span>›</span>
            <span className="text-[#0F2D5E] font-semibold">Enquiry</span>
          </nav>
          <h1 className="font-serif font-bold text-[clamp(1.75rem,3vw,2.5rem)] text-[#0F2D5E] leading-tight mb-3">
            Your Direct Line to China&apos;s Best Factories —<br className="hidden sm:block" /> No Alibaba Guesswork Required
          </h1>
          <p className="text-base text-gray-600 max-w-[560px]">
            We connect Australian businesses with verified Chinese manufacturers — and vet every supplier before you sign anything. Tell us what you need.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto">

          {/* Desktop: left (paths + trust) / right (form) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left column: What happens next + trust stats */}
            <div className="flex flex-col gap-6">

              {/* What happens next — two paths */}
              <div>
                <h3 className="font-serif font-bold text-lg mb-6 text-[#0F2D5E]">Here&apos;s what happens after you reach out</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Path 1: Visit in China */}
                  <div className="border-2 border-[#0F2D5E] rounded-lg p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-[#0F2D5E] text-white flex items-center justify-center flex-shrink-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0F2D5E]">Path 1 — Visit Factories in China</p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {[
                        ['We get in touch', 'Within 4 business hours'],
                        ['We shortlist suppliers', '2-3 verified factories matched to your needs'],
                        ['We plan your trip', 'Flights, hotel, and factory schedule arranged'],
                        ['You visit in person', 'Guided tours, technical meetings, quality inspection'],
                        ['Production & shipping', 'We monitor production and ship to your door'],
                      ].map(([title, sub], i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#0F2D5E] text-[#F59E0B] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#0F2D5E]">{title} — </span>
                            <span className="text-xs text-gray-500">{sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Path 2: Remote / No travel */}
                  <div className="border-2 border-[#0F2D5E] rounded-lg p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-[#0F2D5E] text-white flex items-center justify-center flex-shrink-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0F2D5E]">Path 2 — Remote Verification</p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {[
                        ['We get in touch', 'Within 4 business hours'],
                        ['We shortlist suppliers', '2-3 verified factories matched to your needs'],
                        ['We send you reports', 'Video walkthroughs, photos, and sample quotes'],
                        ['You review from here', 'No travel needed — full transparency from Australia'],
                        ['We arrange shipping', 'Production monitoring and delivery managed end-to-end'],
                      ].map(([title, sub], i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#0F2D5E] text-[#F59E0B] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#0F2D5E]">{title} — </span>
                            <span className="text-xs text-gray-500">{sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Trust stats */}
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0F2D5E]">Verified</p>
                  <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Listed Partner</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-lg font-bold text-[#0F2D5E]">4hrs</p>
                  <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Response</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0F2D5E]">$0</p>
                  <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Upfront</p>
                </div>
              </div>

            </div>

            {/* Right column: Form card */}
            <div>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase mb-2">Get in Touch</p>
            <h2 className="font-serif font-bold text-[1.375rem] text-[#0F2D5E] mb-6">
              Submit Your Sourcing Enquiry
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-[#0F2D5E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={28} className="text-[#F59E0B]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F2D5E] mb-3">
                  Your Enquiry Is In Our Hands
                </h3>
                <p className="text-gray-600 max-w-[360px] mx-auto mb-8">
                  We&apos;ll review your requirements and reach out within 4 business hours.
                </p>
                <Link href="/" className="px-6 py-2.5 bg-[#0F2D5E] text-white text-sm font-semibold hover:bg-[#0a2148] transition-colors no-underline">
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="pb-20 md:pb-0">
                <div className="flex flex-col gap-5">
                  <KeyboardAwareInput
                    id="fullName"
                    label="Full Name"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    error={touched.fullName ? errors.fullName : undefined}
                  />

                  <KeyboardAwareInput
                    id="email"
                    type="email"
                    label="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="jane@company.com.au"
                    autoComplete="email"
                    error={touched.email ? errors.email : undefined}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KeyboardAwareInput
                      id="phone"
                      type="tel"
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlurExtra('phone')}
                      placeholder="+61 4xx xxx xxx"
                      autoComplete="tel"
                    />

                    <KeyboardAwareInput
                      id="company"
                      label="Company"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      onBlur={() => handleBlurExtra('company')}
                      placeholder="Your company name"
                      autoComplete="organization"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
                    >
                      Industry
                    </label>
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      onBlur={() => handleBlurExtra('industry')}
                      className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E] transition-colors bg-white"
                    >
                      <option value="">Select your industry...</option>
                      <option value="av-audio-visual">AV & Audio-Visual Equipment</option>
                      <option value="automotive">Automotive Parts & Accessories</option>
                      <option value="agricultural">Agricultural Machinery & Equipment</option>
                      <option value="engineering">Engineering & Heavy Equipment</option>
                      <option value="electronics">Consumer Electronics</option>
                      <option value="homewares">Homewares & Furnishings</option>
                      <option value="beauty">Beauty & Aesthetics</option>
                      <option value="fashion">Fashion & Textiles</option>
                      <option value="food-beverage">Food & Beverage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <KeyboardAwareTextarea
                    id="lookingFor"
                    label="What do you need?"
                    required
                    value={formData.lookingFor}
                    onChange={(e) => handleChange('lookingFor', e.target.value)}
                    onBlur={() => handleBlur('lookingFor')}
                    placeholder="Describe your product, quantity, quality requirements..."
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
                    className="w-full py-4 md:py-3.5 px-6 bg-[#0F2D5E] text-white font-semibold hover:bg-[#0a2148] active:bg-[#071a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Sending…' : 'Submit Enquiry →'}
                  </button>

                  <a
                    href="https://calendly.com/mark-winningadventure/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-[#0F2D5E] hover:text-[#F59E0B] mt-1"
                  >
                    Prefer to talk? Book a call →
                  </a>
                </div>
              </form>
            )}
          </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {[
              { q: "Is there any upfront cost to enquire?", a: "None. The initial consultation is completely free." },
              { q: "Do you push me towards specific suppliers?", a: "No. The decision is entirely yours." },
              { q: "What if I'm not ready to travel yet?", a: "Book a call to discuss — we can plan well in advance." },
            ].map((item, i) => (
              <div key={i} className="px-6 py-5">
                <p className="text-sm font-semibold text-[#0F2D5E] mb-1.5">{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Direct Contact</h4>
              <div className="flex items-start gap-2.5 text-sm text-gray-600 mb-2">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>5, 54 Melbourne St, North Adelaide SA 5006</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm mb-4">
                <Mail size={16} className="flex-shrink-0" />
                <a href="mailto:mark@winningadventure.com.au" className="text-[#0F2D5E] font-medium hover:text-[#F59E0B]">
                  mark@winningadventure.com.au
                </a>
              </div>
            </div>

            <div className="bg-[#f3f4f6] border border-gray-200 rounded-lg p-6 flex flex-col justify-center gap-4">
              {([
                [CheckCircle, 'Verified Suppliers Only'],
                [DollarSign, 'No Hidden Fees'],
                [Building2, 'Adelaide-Based Team'],
              ] as [React.ElementType, string][]).map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 text-sm font-semibold text-[#0F2D5E]">
                  <div className="w-8 h-8 bg-[#0F2D5E] rounded-full flex items-center justify-center flex-shrink-0">
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
