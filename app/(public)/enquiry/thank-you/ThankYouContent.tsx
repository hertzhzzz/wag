'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useT } from '@/i18n/useT'

export default function ThankYouContent({ enquiryId }: { enquiryId: string | null }) {
  const t = useT()

  return (
    <>
      <Navbar />

      <section className="min-h-[70vh] bg-surface-warm border-b border-gray-200 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase mb-4">
            {t('page.enq.breadcrumb.enquiry')}
          </p>
          <h1 className="font-serif font-bold text-[clamp(1.75rem,3vw,2.5rem)] text-navy leading-tight mb-4 text-balance">
            {t('page.enq.thankyou.heading')}
          </h1>
          <p className="text-base text-gray-600 mb-8 text-pretty">
            {t('page.enq.thankyou.body')}
          </p>

          {enquiryId && (
            <div className="mb-10 rounded-lg border border-gray-200 bg-white px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {t('page.enq.thankyou.ref_label')}
              </p>
              <p className="font-mono text-sm sm:text-base text-navy break-all">{enquiryId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center py-3.5 px-6 bg-navy text-white font-semibold hover:bg-navy-dark active:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 transition-colors duration-200 ease-out"
            >
              {t('page.enq.thankyou.home')}
            </Link>
            <a
              href="https://calendly.com/mark-winningadventure/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center py-3.5 px-6 text-sm font-semibold text-navy border border-navy bg-transparent hover:bg-navy hover:text-white active:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 transition-colors duration-200 ease-out"
            >
              {t('page.enq.thankyou.book_call')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
