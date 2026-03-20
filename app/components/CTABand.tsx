import Link from 'next/link'

export default function CTABand() {
  return (
    <section className="bg-white border-t border-gray-200 py-12 px-4 md:px-10 w-full relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-10 flex-wrap relative z-[1]">
        <div>
          <h2 className="font-serif text-[2rem] font-semibold text-navy mb-2.5">
            Your Suppliers Are Ready. Are You?
          </h2>
          <p className="text-base text-gray-500">
            Book a free 30-minute discovery call — no obligation, no pressure.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap flex-shrink-0">
          <Link
            href="/enquiry"
            className="bg-navy text-white px-7 py-3.5 border-0 rounded font-sans text-[0.95rem] font-semibold cursor-pointer inline-block transition-all hover:bg-[#163d73] hover:-translate-y-px min-h-11"
          >
            Start Your China Trip →
          </Link>
          <Link
            href="/#howitworks"
            className="bg-white text-navy px-7 py-3.5 border-2 border-navy rounded font-sans text-[0.95rem] font-medium cursor-pointer inline-block transition-all hover:bg-[#f0f4fa] hover:-translate-y-px min-h-11"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  )
}
