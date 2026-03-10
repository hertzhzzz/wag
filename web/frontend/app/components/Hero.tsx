import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-[50vh] md:min-h-[600px] flex items-center">
      {/* Video Background - Full Width */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80"
        >
          <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay - 70% to make text readable */}
        <div className="absolute inset-0 bg-navy/70" />
      </div>

      {/* Text Content - Left Side */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-20 py-16">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-gray-300 mb-6">
          Winning Adventure Global · China Business Trip Guide · Adelaide
        </p>
        <h1>
          <span className="block leading-[1.05] tracking-[-1.5px] font-serif font-bold text-[clamp(36px,5vw,64px)] text-white">
            Your Chinese
          </span>
          <span className="block leading-[1.05] tracking-[-1.5px] font-serif font-bold italic text-[clamp(36px,5vw,64px)] text-amber">
            Factory Partners
          </span>
          <span className="block leading-[1.05] tracking-[-1.5px] font-serif font-bold text-[clamp(36px,5vw,64px)] text-white">
            Are Already Waiting.
          </span>
        </h1>
        <p className="text-base font-light leading-[1.75] text-gray-300 max-w-[480px] mt-6 mb-8">
          We connect Australian businesses directly to China&apos;s best manufacturers. Whether you&apos;re exploring new suppliers or ready to procure — we guide you on the ground, every step of the way.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/enquiry"
            className="inline-block bg-amber text-navy px-8 py-4 font-bold hover:bg-[#d97706] transition-colors no-underline min-h-11"
          >
            Book a Free Discovery Call →
          </Link>
          <a
            href="#howitworks"
            className="inline-block border border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-navy transition-colors no-underline text-sm min-h-11"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  )
}
