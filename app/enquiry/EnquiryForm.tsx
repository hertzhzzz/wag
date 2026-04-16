'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Lock, MapPin, Mail, CheckCircle, DollarSign, Building2, ArrowLeft, ArrowRight } from 'lucide-react'
import { KeyboardAwareInput } from './components/KeyboardAwareInput'
import { KeyboardAwareTextarea } from './components/KeyboardAwareTextarea'

function CalendlyWidget() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onload = () => setLoading(false)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  return (
    <div className="relative" style={{ minWidth: '280px', height: '600px' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 rounded">
          <div className="w-8 h-8 border-2 border-[#0F2D5E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading calendar...</p>
        </div>
      )}
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/mark-winningadventure/"
        style={{ minWidth: '280px', height: '600px' }}
      />
    </div>
  )
}

export default function EnquiryForm() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('postMessage') ||
          event.message?.includes('content_script')) {
        event.preventDefault()
      }
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const [step, setStep] = useState(1)
  const [selectedContact, setSelectedContact] = useState<'call' | 'form'>('call')
  const [formData, setFormData] = useState({
    fullName: '', companyName: '', email: '', phone: '',
    industry: '', customIndustry: '', sourcingType: '', lookingFor: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    return newErrors
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.industry.trim()) newErrors.industry = 'Please select your industry'
    if (formData.industry === 'other' && !formData.customIndustry.trim()) {
      newErrors.customIndustry = 'Please specify your industry'
    }
    if (!formData.sourcingType.trim()) newErrors.sourcingType = 'Please select an option'
    if (!formData.lookingFor.trim()) newErrors.lookingFor = 'Please describe what you need'
    return newErrors
  }

  const handleNext = () => {
    const newErrors = validateStep1()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
    } else {
      setErrors({})
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateStep2()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
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

  const inputClass = (field: string) =>
    `w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#0F2D5E]'
    }`

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
            We connect Australian businesses with ITC Electronics — a publicly listed Chinese manufacturer — and vet every supplier before you sign anything. Tell us what you need.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">

          {/* Mobile tab selector */}
          <div className="lg:hidden flex gap-2 p-1 bg-gray-100 rounded-lg">
            {([
              { id: 'call', label: 'Book a Call' },
              { id: 'form', label: 'Submit Enquiry' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedContact(tab.id)}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-md transition-all ${
                  selectedContact === tab.id
                    ? 'bg-[#0F2D5E] text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#0F2D5E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Two-column: Book a Call | Submit Enquiry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: Calendly */}
            <div className={`bg-white border border-gray-200 rounded-lg p-8 ${selectedContact !== 'call' ? 'hidden lg:block' : ''}`}>
              <p className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase mb-2">Option 1</p>
              <h2 className="font-serif font-bold text-[1.375rem] text-[#0F2D5E] mb-2">Book a Call</h2>
              <p className="text-sm text-gray-600 mb-4">
                Pick a time that works for you. 30 minutes, no obligation.
              </p>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm font-semibold text-[#0F2D5E]">Mark Zhe He</p>
                <p className="text-xs text-gray-400">Managing Director · Australia Office</p>
              </div>
              <CalendlyWidget />
            </div>

            {/* RIGHT: Enquiry Form - 2 Step */}
            <div className={`bg-white border border-gray-200 rounded-lg p-8 ${selectedContact !== 'form' ? 'hidden lg:block' : ''}`}>
              <p className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase mb-2">Option 2</p>
              <h2 className="font-serif font-bold text-[1.375rem] text-[#0F2D5E] mb-2">
                Submit Your Sourcing Enquiry
              </h2>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1 ? 'bg-[#0F2D5E] text-white' : 'bg-gray-200 text-gray-400'
                }`}>1</div>
                <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#0F2D5E]' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? 'bg-[#0F2D5E] text-white' : 'bg-gray-200 text-gray-400'
                }`}>2</div>
                <span className="text-sm text-gray-500 ml-2">
                  {step === 1 ? 'Step 1: Contact' : 'Step 2: Details'}
                </span>
              </div>

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
                  {/* Step 1: Contact Info */}
                  {step === 1 && (
                    <div className="flex flex-col gap-5">
                      <KeyboardAwareInput
                        id="fullName"
                        label="Full Name"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Jane Smith"
                        autoComplete="name"
                        error={errors.fullName}
                      />

                      <KeyboardAwareInput
                        id="email"
                        type="email"
                        label="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="jane@company.com.au"
                        autoComplete="email"
                        error={errors.email}
                      />

                      <KeyboardAwareInput
                        id="phone"
                        type="tel"
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+61 4XX XXX XXX"
                        autoComplete="tel"
                      />

                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3.5 px-6 bg-[#0F2D5E] text-white font-semibold hover:bg-[#0a2148] active:bg-[#071a3a] transition-colors flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight size={18} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Company Details */}
                  {step === 2 && (
                    <div className="flex flex-col gap-5">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0F2D5E] transition-colors w-fit"
                      >
                        <ArrowLeft size={16} /> Back to contact
                      </button>

                      <KeyboardAwareInput
                        id="companyName"
                        label="Company Name"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder="Acme Pty Ltd"
                        autoComplete="organization"
                        error={errors.companyName}
                      />

                      <div>
                        <label htmlFor="industry" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                          Industry / Sector <span className="text-[#F59E0B]">*</span>
                        </label>
                        <select
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          className={`${inputClass('industry')} pr-10 appearance-none bg-white cursor-pointer`}
                        >
                          <option value="">Select your industry...</option>
                          <option value="aesthetics">Aesthetics &amp; Cosmetics</option>
                          <option value="drones">Agricultural Drones</option>
                          <option value="chemical">Chemical &amp; Industrial</option>
                          <option value="fashion">Fashion &amp; Apparel</option>
                          <option value="food">Food &amp; Beverage</option>
                          <option value="healthcare">Healthcare &amp; Medical</option>
                          <option value="construction">Construction &amp; Building</option>
                          <option value="technology">Technology &amp; Electronics</option>
                          <option value="furniture">Furniture &amp; Homewares</option>
                          <option value="cbd">CBD Retail &amp; Commercial</option>
                          <option value="property">Industrial Property</option>
                          <option value="av">AV &amp; Smart Systems</option>
                          <option value="other">Other (please specify)</option>
                        </select>
                        {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
                      </div>

                      {formData.industry === 'other' && (
                        <KeyboardAwareInput
                          type="text"
                          label="Specify Industry"
                          value={formData.customIndustry}
                          onChange={(e) => setFormData({...formData, customIndustry: e.target.value})}
                          placeholder="Enter your industry..."
                          error={errors.customIndustry}
                        />
                      )}

                      <div>
                        <p className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                          Do you already have a supplier? <span className="text-[#F59E0B]">*</span>
                        </p>
                        <div className="flex flex-col gap-2.5">
                          {[
                            { value: 'new', label: 'No — I\'m looking for a supplier from scratch' },
                            { value: 'existing', label: 'Yes — I have a supplier but want to improve or compare' },
                            { value: 'oem', label: 'I\'m working with a supplier and want OEM/custom products' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${
                                formData.sourcingType === option.value
                                  ? 'border-[#0F2D5E] bg-[#0F2D5E]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="sourcingType"
                                value={option.value}
                                checked={formData.sourcingType === option.value}
                                onChange={(e) => setFormData({...formData, sourcingType: e.target.value})}
                                className="mt-0.5 accent-[#0F2D5E]"
                              />
                              <span className="text-sm text-[#0F2D5E]">{option.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.sourcingType && <p className="mt-1.5 text-xs text-red-500">{errors.sourcingType}</p>}
                      </div>

                      <KeyboardAwareTextarea
                        id="lookingFor"
                        label="What are you looking for?"
                        required
                        value={formData.lookingFor}
                        onChange={(e) => setFormData({...formData, lookingFor: e.target.value})}
                        placeholder="Describe your product, quantity, quality requirements..."
                        rows={4}
                        error={errors.lookingFor}
                      />

                      {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          {errors.submit}
                        </div>
                      )}

                      {/* Trust stats */}
                      <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#0F2D5E]">ITC</p>
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

                      {/* Sticky submit button for mobile */}
                      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:relative md:bottom-auto md:p-0 md:bg-transparent md:border-0">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-4 md:py-3.5 px-6 bg-[#0F2D5E] text-white font-semibold hover:bg-[#0a2148] active:bg-[#071a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? 'Sending…' : 'Submit Enquiry →'}
                        </button>
                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 mt-2 md:mt-0">
                          <Lock size={12} />
                          We&apos;ll be in touch within 4 business hours.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-[#0F2D5E] text-white rounded-lg p-8">
            <h3 className="font-serif font-bold text-lg mb-6">Here&apos;s what happens after you reach out</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                ['1', 'We get in touch', 'Within 4 business hours'],
                ['2', 'We shortlist suppliers', '2-3 verified factories'],
                ['3', 'You visit them in China', 'Full tour arranged'],
              ].map(([n, title, sub]) => (
                <div key={n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-[#0F2D5E] text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {n}
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold mb-1">{title}</strong>
                    <span className="text-[0.8125rem] text-white/70">{sub}</span>
                  </div>
                </div>
              ))}
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
