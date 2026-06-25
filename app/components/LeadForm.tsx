'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

// 共享获客表单：3 字段（姓名/邮箱/需求）→ POST 现有 /api/enquiry
// 字段名严格匹配后端 Zod schema（fullName/email/lookingFor），industry 预填以标记来源
const CONTACT_EMAIL = 'mark@winningadventure.com.au'

const inputClass =
  'w-full border border-navy/15 bg-white px-4 py-3 text-[15px] text-navy placeholder:text-navy/40 ' +
  'focus:outline-none focus:border-navy focus:ring-2 focus:ring-amber/40 transition-colors'

const labelClass = 'block text-[12px] font-semibold text-navy/70 mb-1.5'

export default function LeadForm({
  id,
  heading = 'Book your free consult',
  subcopy = 'Tell us your supplier. We’ll tell you what to check — no obligation.',
}: {
  id?: string
  heading?: string
  subcopy?: string
}) {
  const [form, setForm] = useState({ fullName: '', email: '', lookingFor: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.email.trim() || !form.lookingFor.trim()) {
      setStatus('error')
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, industry: 'Supplier Verification' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div id={id} className="bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,45,94,0.18)]">
        <CheckCircle2 size={40} className="text-amber mx-auto mb-4" />
        <p className="font-serif font-bold text-navy text-xl mb-2">Thanks — we’ve got it.</p>
        <p className="text-navy/70 text-[15px] leading-relaxed">
          Our Australia-based team will review your supplier and be in touch to set up your free
          consult. No obligation.
        </p>
      </div>
    )
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      noValidate
      className="bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,45,94,0.18)]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldCheck size={18} className="text-amber" aria-hidden="true" />
        <p className="font-serif font-bold text-navy text-xl leading-tight">{heading}</p>
      </div>
      <p className="text-navy/70 text-[13px] leading-relaxed mb-6">{subcopy}</p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={`${id ?? 'lf'}-name`} className={labelClass}>
            Full name
          </label>
          <input
            id={`${id ?? 'lf'}-name`}
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id ?? 'lf'}-email`} className={labelClass}>
            Work email
          </label>
          <input
            id={`${id ?? 'lf'}-email`}
            type="email"
            autoComplete="email"
            placeholder="jane@yourcompany.com.au"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id ?? 'lf'}-need`} className={labelClass}>
            What are you sourcing?
          </label>
          <textarea
            id={`${id ?? 'lf'}-need`}
            rows={3}
            placeholder="Product, volume, and your supplier if you already have one."
            value={form.lookingFor}
            onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </div>

        {status === 'error' && (
          <p className="text-[13px] text-red-600 leading-relaxed" role="alert">
            Something went wrong — please check your details and try again, or email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-amber text-navy font-semibold py-3.5 hover:bg-navy hover:text-white transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Book Free Consult'}
        </button>
        <p className="text-navy/50 text-[11px] text-center">
          Your details go straight to our Australia-based team.
        </p>
      </div>
    </form>
  )
}
