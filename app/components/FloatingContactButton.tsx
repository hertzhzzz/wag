'use client'

import { useState, useEffect } from 'react'
import { Mail, X } from 'lucide-react'

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    setSubmitted(false)
    setEmail('')
    setMessage('')
    setError('')
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open contact form"
        className="fixed bottom-5 right-5 z-[9999] group"
      >
        {/* Pulse Ring */}
        <div className="absolute inset-0 -m-4 hidden sm:block">
          <div className="w-16 h-16 mx-auto my-4 border-2 border-navy/50 rounded-full animate-pulse-ring" />
        </div>

        {/* Button Body */}
        <div className="relative w-14 h-14 sm:w-14 sm:h-14 bg-navy rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 flex flex-col items-center justify-center">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="hidden sm:block text-white text-xs font-medium mt-0.5">Contact</span>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-navy/5 text-navy/60 hover:text-navy transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {submitted ? (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Message Sent</h3>
                <p className="text-navy/60 mb-6">
                  We will get back to you within 24 hours.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form State */
              <>
                <h3 className="text-xl font-semibold text-navy mb-6">Contact Us</h3>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 border border-navy/10 rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-navy/10 rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 resize-y"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber text-white font-semibold rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
