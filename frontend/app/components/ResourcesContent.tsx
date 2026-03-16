'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface Article {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  coverImage?: string
  desc?: string
  description?: string
}

interface ResourcesContentProps {
  articles: Article[]
  categories: string[]
}

export default function ResourcesContent({ articles, categories }: ResourcesContentProps) {
  const [activeCategory, setActiveCategory] = useState('All Articles')

  const filteredArticles = activeCategory === 'All Articles'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

  const [featured, ...rest] = filteredArticles

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
    } catch (error) {
      setSubscribeStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0F2D5E] py-14 px-4 md:px-12 border-b-4 border-[#F59E0B]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold tracking-[2px] uppercase text-[#F59E0B] mb-3">Knowledge Hub</p>
          <h1 className="font-serif text-white text-[42px] font-semibold leading-tight">Resources &amp; Insights</h1>
          <p className="text-base text-gray-300 max-w-[560px] mt-3">
            Expert guides on China sourcing, factory visits, and cross-border trade for Australian B2B businesses.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12 flex gap-0 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`block px-5 py-4 text-[13px] font-semibold border-b-[3px] whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'text-[#0F2D5E] border-[#F59E0B]'
                  : 'text-gray-500 border-transparent hover:text-[#0F2D5E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">

        {/* Featured card — left image / right text */}
        {featured && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 mb-12 overflow-hidden">
            {/* Left: image */}
            <Link href={featured.slug} className="relative min-h-[320px] bg-[#0F2D5E] flex items-center justify-center overflow-hidden group">
              {featured.coverImage && (
                <Image
                  src={featured.coverImage} width={800} height={400}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
                />
              )}
              <span className="absolute top-5 left-5 z-10 bg-[#F59E0B] text-[#0F2D5E] py-1 px-3 text-[11px] font-bold uppercase tracking-wide">
                {featured.category}
              </span>
            </Link>

            {/* Right: text */}
            <div className="bg-white p-10 flex flex-col">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Featured Article &nbsp;·&nbsp; {featured.date} &nbsp;·&nbsp; {featured.readTime}
              </p>
              <Link href={featured.slug} className="block">
                <h2 className="font-serif text-[26px] font-semibold leading-snug text-[#0F2D5E] mb-4 hover:text-[#F59E0B] transition-colors">
                  {featured.title}
                </h2>
              </Link>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-8 flex-1">
                {featured.desc || featured.description}
              </p>
              <Link
                href={featured.slug}
                className="self-start bg-[#0F2D5E] text-white px-6 py-3 text-[13px] font-bold tracking-wide hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors min-h-11"
              >
                Read Full Guide
              </Link>
            </div>
          </div>
        )}

        {/* 3-column grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rest.map((article) => (
              <div
                key={article.slug}
                className="bg-white border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,45,94,0.1)] transition-all duration-200"
              >
                {/* Card image */}
                <Link href={article.slug} className="relative h-[180px] bg-[#0F2D5E] flex items-center justify-center overflow-hidden block group">
                  {article.coverImage && (
                    <Image
                      src={article.coverImage} width={400} height={200}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
                    />
                  )}
                  <span className="absolute top-3 left-3 z-10 bg-[#F59E0B] text-[#0F2D5E] py-1 px-2.5 text-[10px] font-bold uppercase tracking-wide">
                    {article.category}
                  </span>
                </Link>

                {/* Card body */}
                <div className="p-6">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                    {article.date} &nbsp;·&nbsp; {article.readTime}
                  </p>
                  <Link href={article.slug} className="block">
                    <h3 className="font-serif text-[18px] font-semibold text-[#0F2D5E] leading-snug mb-3 hover:text-[#F59E0B] transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {article.desc || article.description}
                  </p>
                  <Link
                    href={article.slug}
                    className="text-[13px] font-bold text-[#0F2D5E] hover:text-[#F59E0B] transition-colors"
                  >
                    Read Article →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="bg-[#0F2D5E] py-16 px-4 md:px-12 mt-16">
        <div className="max-w-[600px] mx-auto text-center">
          {subscribeStatus === 'success' ? (
            <>
              <h2 className="font-serif text-white text-[28px] font-semibold mb-3">
                You're on the list!
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
              <form onSubmit={handleSubscribe} className="flex max-w-[440px] mx-auto">
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
