import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Winning Adventure Global',
  description: 'The page you are looking for does not exist or has been moved. Get back on track with our China sourcing expertise.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <>
      <Navbar />

      <section className="min-h-[70vh] bg-[#0F2D5E] flex items-center justify-center px-8">
        <div className="text-center max-w-[600px]">
          <p className="text-[#F59E0B] text-sm font-bold tracking-[0.2em] uppercase mb-4">
            404 Error
          </p>
          <h1 className="font-serif text-white text-[clamp(3rem,8vw,6rem)] font-bold leading-tight mb-6">
            Page Not Found
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-[480px] mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-[#F59E0B] text-[#0F2D5E] px-8 py-4 text-sm font-bold hover:bg-[#d97706] transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/services"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-center text-sm font-bold tracking-[0.15em] text-[#F59E0B] uppercase mb-8">
            Quick Links
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { href: '/', label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: '/resources', label: 'Resources' },
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
