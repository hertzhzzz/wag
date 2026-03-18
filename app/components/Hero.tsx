import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center overflow-hidden">
      {/* Hero Image - Mobile: show only (no video to block LCP) */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/hero-image.webp"
          alt="Chinese manufacturing facility with Australian business team"
          fill
          priority={true}
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />
        {/* Gradient overlay for mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
      </div>

      {/* Video Background - Desktop only (not on mobile to fix LCP) */}
      <div className="hidden md:block absolute inset-0" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover"
          poster="/hero-image.webp"
        >
          <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
        </video>

        {/* Professional gradient overlay - more sophisticated than simple solid */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
      </div>

      {/* Decorative element - subtle diagonal line */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-amber/5 to-transparent skew-x-12" />

      {/* Text Content - Left Side with improved hierarchy */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-28">
        {/* Brand tag - more refined */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-amber/70" />
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/70">
            Adelaide · Australia
          </p>
        </div>

        <h1 className="max-w-3xl">
          <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold text-[clamp(40px,6vw,72px)] text-white">
            Your Chinese
          </span>
          <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold italic text-[clamp(40px,6vw,72px)] text-amber">
            Factory Partners
          </span>
          <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold text-[clamp(40px,6vw,72px)] text-white">
            Are Already Waiting.
          </span>
        </h1>

        <p className="text-lg md:text-xl font-light leading-[1.7] text-white/80 max-w-[520px] mt-6 mb-10">
          We connect Australian businesses directly to China&apos;s best manufacturers. Whether you&apos;re exploring new suppliers or ready to procure — we guide you on the ground, every step of the way.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/enquiry"
            className="inline-flex items-center gap-3 bg-amber text-navy px-8 py-4 font-bold hover:bg-[#d97706] transition-all duration-300 no-underline min-h-11 shadow-lg hover:shadow-xl hover:shadow-amber/20 hover:-translate-y-0.5"
          >
            Book a Free Discovery Call
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#howitworks"
            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300 no-underline text-sm min-h-11 backdrop-blur-sm"
          >
            See How It Works
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Trust indicators - professional B2B element */}
        <div className="flex flex-wrap items-center gap-8 mt-14 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>15+ Industries</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>627+ Verified Suppliers</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>4hr Response Time</span>
          </div>
        </div>
      </div>
    </section>
  )
}
