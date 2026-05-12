'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'

interface Article {
  slug: string
  title: string
  category: string
  date: string
  updatedDate?: string
  readTime: string
  coverImage?: string
  desc?: string
  description?: string
  featured?: boolean
}

interface ResourcesContentProps {
  articles: Article[]
}

export default function ResourcesContent({ articles }: ResourcesContentProps) {
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      if (!a.date || !b.date) return 0
      return a.date < b.date ? 1 : -1
    })
  }, [articles])

  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid business email')
      setSubscribeStatus('error')
      return
    }

    setSubscribeStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubscribeStatus('success')
        setEmail('')
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch {
      setSubscribeStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0F2D5E] py-8 md:py-14 px-4 md:px-12 border-b-4 border-[#F59E0B]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold tracking-[2px] uppercase text-[#F59E0B] mb-3">Knowledge Hub</p>
          <h1 className="font-serif text-white text-[32px] md:text-[42px] font-semibold leading-tight">China Sourcing Agent Resources</h1>
          <p className="text-base text-gray-300 max-w-[560px] mt-3">
            Expert guides on China sourcing, factory visits, and cross-border trade for Australian B2B businesses.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">

        {/* Article cards - Vertical Masonry */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {sortedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="block bg-white border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,45,94,0.1)] transition-all duration-200 break-inside-avoid"
              >
                {/* Card image */}
                <div className="relative bg-[#0F2D5E] flex items-center justify-center overflow-hidden">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      width={400}
                      height={200}
                      alt={article.title}
                      className="w-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-[#0F2D5E]/30" />
                  )}
                  <span className="absolute top-3 left-3 z-10 bg-[#F59E0B] text-[#0F2D5E] py-1 px-2.5 text-[10px] font-bold uppercase tracking-wide">
                    {article.category}
                  </span>
                </div>
                {/* Card body */}
                <div className="p-5">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                    {article.date} · {article.readTime}
                  </p>
                  <h3 className="font-serif text-[16px] font-semibold text-[#0F2D5E] leading-snug mb-3 hover:text-[#F59E0B] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {article.desc || article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
      </div>

      {/* Explore More Section */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-12 mt-8">
        <h2 className="font-serif text-2xl font-bold text-navy mb-8 text-center">
          Explore More
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/case-studies"
            className="block bg-navy/5 border border-navy/10 p-7 hover:bg-navy/10 transition-colors"
          >
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit block mb-4">
              Case Studies
            </span>
            <h3 className="font-serif text-[1.15rem] font-bold text-navy leading-snug mb-3">
              Success Stories
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Real results from Australian businesses who sourced with WAG.
            </p>
          </Link>
          <Link
            href="/services"
            className="block bg-navy/5 border border-navy/10 p-7 hover:bg-navy/10 transition-colors"
          >
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit block mb-4">
              Services
            </span>
            <h3 className="font-serif text-[1.15rem] font-bold text-navy leading-snug mb-3">
              What We Offer
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Factory tours, supplier verification, and end-to-end procurement support.
            </p>
          </Link>
          <Link
            href="/resources/china-sourcing-agent"
            className="block bg-amber/10 border border-amber/20 p-7 hover:bg-amber/20 transition-colors"
          >
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-navy bg-navy/10 px-2.5 py-1 w-fit block mb-4">
              Service Page
            </span>
            <h3 className="font-serif text-[1.15rem] font-bold text-navy leading-snug mb-3">
              China Sourcing Agent
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Direct factory access without middleman markups. Start your quote.
            </p>
          </Link>
          <Link
            href="/adelaide"
            className="block bg-navy/5 border border-navy/10 p-7 hover:bg-navy/10 transition-colors"
          >
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit block mb-4">
              Factory Directory
            </span>
            <h3 className="font-serif text-[1.15rem] font-bold text-navy leading-snug mb-3">
              Adelaide
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Verified manufacturers ready to work with Australian businesses.
            </p>
          </Link>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-[#0F2D5E] py-16 px-4 md:px-12 mt-16">
        <div className="max-w-[600px] mx-auto text-center">
          {subscribeStatus === 'success' ? (
            <>
              <h2 className="font-serif text-white text-[28px] font-semibold mb-3">
                You&apos;re on the list!
              </h2>
              <p className="text-gray-300 text-[15px] mb-4">
                Thank you for subscribing. Check your inbox for a confirmation email.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-white text-[28px] font-semibold mb-3">
                Stay Ahead of the Supply Chain
              </h2>
              <p className="text-gray-300 text-[15px] mb-8">
                Monthly insights on China sourcing, delivered to Australian importers who want an edge.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-[440px] mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (subscribeStatus === 'error') setSubscribeStatus('idle')
                  }}
                  placeholder="Your business email"
                  className="flex-1 px-5 py-4 text-[14px] font-sans outline-none border-0"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'loading'}
                  className="bg-[#F59E0B] text-[#0F2D5E] px-6 py-4 text-[13px] font-bold whitespace-nowrap hover:bg-amber-400 transition-colors disabled:opacity-50 min-h-11"
                >
                  {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
              {subscribeStatus === 'error' && (
                <p className="text-red-400 text-sm mt-3" role="alert">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
