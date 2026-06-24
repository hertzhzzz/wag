import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '410 - Content Removed',
  description: 'This article has been retired. Explore our current China sourcing resources for Australian businesses.',
  robots: {
    index: false,
    follow: true,
  },
}

// Rendered with a 410 status via middleware rewrite (see middleware.ts).
// Reuses the real Navbar + Footer components so it stays in sync with the site.
export default function Gone() {
  return (
    <>
      <Navbar />

      <section className="min-h-[60vh] bg-[#0F2D5E] flex items-center justify-center px-8 pt-24 pb-16">
        <div className="text-center max-w-[600px]">
          <p className="text-[#F59E0B] text-sm font-bold tracking-[0.2em] uppercase mb-4">
            410 · Content Removed
          </p>
          <h1 className="font-serif text-white text-[clamp(2.5rem,8vw,5rem)] font-bold leading-tight mb-6">
            This Article Is No Longer Available
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-[480px] mx-auto">
            We&rsquo;ve retired this page to keep our library focused on practical
            China sourcing guidance for Australian businesses. Explore our current
            resources instead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/article"
              className="bg-[#F59E0B] text-[#0F2D5E] px-8 py-4 text-sm font-bold hover:bg-[#d97706] transition-colors"
            >
              Browse Articles
            </Link>
            <Link
              href="/"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-center text-sm font-bold tracking-[0.15em] text-[#F59E0B] uppercase mb-8">
            Quick Links
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { href: '/', label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: '/article', label: 'Articles' },
              { href: '/enquiry', label: 'Get in Touch' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-center p-4 border border-gray-200 hover:border-[#0F2D5E] hover:shadow-lg transition-all"
              >
                <span className="text-[#0F2D5E] font-semibold">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
