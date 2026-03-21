'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bot, X, Send, Loader2, ChevronRight } from 'lucide-react'

type ChatState = 'idle' | 'greeting' | 'options' | 'selected' | 'form' | 'submitted'

interface Option {
  id: string
  label: string
  response: string
}

const SERVICE_OPTIONS: Option[] = [
  {
    id: 'service',
    label: 'Factory Discovery Service',
    response: 'Our Factory Discovery Service helps you find and verify reliable manufacturers in China. We conduct on-site audits, quality inspections, and facilitate direct communication. Would you like to learn more?'
  },
  {
    id: 'pricing',
    label: 'Pricing & Costs',
    response: 'Our pricing is tailored to your specific needs. Factors include service scope, factory count, and engagement duration. We offer transparent pricing with no hidden fees. Shall I send you our detailed pricing guide?'
  },
  {
    id: 'partnership',
    label: 'Partnership Opportunities',
    response: 'We collaborate with sourcing agents, trading companies, and industry consultants. Our partnership program offers exclusive benefits, volume discounts, and dedicated support. Interested in exploring this?'
  },
  {
    id: 'other',
    label: 'Something Else',
    response: 'I understand you have a specific inquiry. Let me connect you with our team who can provide personalized assistance for your unique needs.'
  }
]

const MESSAGES = {
  greeting: "Hi! I can help with Factory Discovery, Pricing & Costs, Partnership Opportunities, and more. What would you like to explore?",
  selectPrompt: "Choose a topic below:",
  emailPrompt: "To send you the most relevant details, please share your email and we'll respond within 24 hours."
}

export default function AIChatBox() {
  const [chatState, setChatState] = useState<ChatState>('idle')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toastError, setToastError] = useState('')
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Handle click outside to minimize
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (chatState !== 'idle' && chatState !== 'submitted') {
          resetChat()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [chatState])

  // Toast auto-dismiss
  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastError])

  // Scroll to form when it becomes visible
  useEffect(() => {
    if (chatState === 'form' && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [chatState])

  const resetChat = () => {
    setChatState('idle')
    setEmail('')
    setMessage('')
    setToastError('')
    setSelectedOption(null)
  }

  const handleOpen = () => {
    setChatState('greeting')
  }

  const handleSelectOption = (option: Option) => {
    setSelectedOption(option)
    setChatState('selected')
    // User must click "Get Details" button to proceed to form
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToastError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })

      if (res.ok) {
        setChatState('submitted')
      } else {
        const data = await res.json()
        setToastError(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setToastError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetChat()
  }

  const isExpanded = chatState !== 'idle'

  return (
    <>
      {/* Chat Box Container - fixed position */}
      <div
        ref={containerRef}
        className={`fixed bottom-6 right-6 sm:bottom-5 sm:right-5 z-[9999] transition-all duration-300 ease-out ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Main Chat Box */}
        <div
          className={`relative transition-all duration-300 ease-out ${
            isExpanded ? 'w-[80vw] sm:w-96 max-w-[340px] sm:max-w-none' : 'w-14 h-14'
          }`}
        >
          {/* Pulse Ring - only visible when chat is idle/closed */}
          {!isExpanded && (
            <div className="absolute inset-0 -m-4 hidden sm:block">
              <div className="w-16 h-16 mx-auto my-4 border-2 border-navy/50 rounded-full animate-pulse-ring" />
            </div>
          )}

          {/* Expanded Chat Panel */}
          {isExpanded ? (
            <div
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-navy/10`}
            >
              {/* Header - Navy bar */}
              <div className="bg-navy px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Assistant</p>
                    <p className="text-white/60 text-xs">Winning Adventure Global</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Content - Light background */}
              <div className="p-5 min-h-[320px] bg-white">
                {/* Toast Error - auto dismisses after 4s */}
                {toastError && (
                  <div className="mb-3 p-2 bg-red-500 text-white text-xs rounded-lg flex items-center justify-between">
                    <span>{toastError}</span>
                    <button onClick={() => setToastError('')} className="ml-2 hover:opacity-70">x</button>
                  </div>
                )}

                {/* Greeting State */}
                {chatState === 'greeting' && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-navy/10 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-navy" />
                      </div>
                      <div className="bg-navy/5 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-navy/80 text-sm leading-relaxed">{MESSAGES.greeting}</p>
                      </div>
                    </div>
                    <p className="mt-3 ml-11 text-navy/50 text-xs">{MESSAGES.selectPrompt}</p>
                  </div>
                )}

                {/* Options State */}
                {(chatState === 'greeting' || chatState === 'options') && (
                  <div className="mt-4 ml-11 space-y-2">
                    {SERVICE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option)}
                        className="w-full text-left px-4 py-3 bg-white border border-navy/10 rounded-xl hover:bg-navy/5 hover:border-navy/20 transition-all duration-150 flex items-center justify-between group"
                      >
                        <span className="text-navy text-sm font-medium">{option.label}</span>
                        <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-navy/70 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Option Response */}
                {chatState === 'selected' && selectedOption && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 bg-navy/10 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-navy" />
                      </div>
                      <div className="bg-navy/5 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-navy/80 text-sm leading-relaxed">{selectedOption.response}</p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex items-center gap-1 ml-11">
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>

                    {/* Get Details Button - USER INITIATED */}
                    <div className="mt-4 ml-11">
                      <button
                        onClick={() => setChatState('form')}
                        className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 transition-all duration-150 flex items-center gap-2"
                      >
                        Get Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Form State */}
                {chatState === 'form' && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 bg-navy/10 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-navy" />
                      </div>
                      <div className="bg-navy/5 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-navy/80 text-sm leading-relaxed">{MESSAGES.emailPrompt}</p>
                      </div>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 mt-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 bg-white border border-navy/10 rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 text-sm transition-all"
                      />
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Any specific questions or details..."
                        required
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-navy/10 rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 text-sm resize-y transition-all"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy/90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Submitted State */}
                {chatState === 'submitted' && (
                  <div className="animate-in fade-in duration-200 text-center py-6">
                    <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-navy font-semibold text-lg mb-2">Message Sent</h3>
                    <p className="text-navy/60 text-sm mb-5">
                      Our team will get back to you within 24 hours.
                    </p>

                    {/* View More Links */}
                    <div className="flex flex-col gap-2 mb-4">
                      <Link
                        href="/resources"
                        className="text-sm text-amber hover:text-amber/80 font-medium underline underline-offset-2"
                      >
                        View More Resources
                      </Link>
                      <Link
                        href="/services"
                        className="text-sm text-amber hover:text-amber/80 font-medium underline underline-offset-2"
                      >
                        Explore Our Services
                      </Link>
                    </div>

                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-navy text-white text-sm font-medium rounded-xl hover:bg-navy/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Collapsed Button - Navy circle with Bot icon */
            <button
              onClick={handleOpen}
              aria-label="Open chat"
              className={`w-14 h-14 bg-navy rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center`}
            >
              <Bot className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
