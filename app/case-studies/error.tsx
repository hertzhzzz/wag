'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Error() {
  return (
    <>
      <Navbar />
      <section className="bg-navy py-20 px-4 md:px-8 min-h-[50vh] flex items-center">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber mb-4">
            Error
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] text-white font-bold mb-4 leading-tight">
            Something went wrong
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            We could not load the case studies at this time. Please try again
            or return to the homepage.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber text-navy py-3 px-8 font-semibold hover:bg-[#d97706] transition-colors min-h-11"
          >
            Return to Homepage
          </Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
