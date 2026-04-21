import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 py-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logos/logo-footer.png" alt="Winning Adventure Global" width={200} height={40} className="h-10 w-auto" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-[260px] mb-6">
              Connecting Australian businesses with China&apos;s finest manufacturers. Your trusted partner for factory sourcing and business travel.
            </p>
            <a
              href="https://www.linkedin.com/company/winning-adventure-global"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Winning Adventure Global on LinkedIn"
              className="inline-flex items-center gap-2 text-white/70 text-sm font-medium border border-white/20 px-4 py-2 rounded-lg hover:border-amber hover:text-amber hover:bg-white/5 transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Follow us on LinkedIn
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-amber mb-6">
              Services
            </h4>
            <ul className="list-none space-y-3">
              <li>
                <Link href="/services" className="text-white/70 text-sm hover:text-white transition-colors">
                  Business Discovery Trip
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/70 text-sm hover:text-white transition-colors">
                  Procurement Support
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/70 text-sm hover:text-white transition-colors">
                  Factory Verification
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/70 text-sm hover:text-white transition-colors">
                  Quality Inspection
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-amber mb-6">
              Industries
            </h4>
            <ul className="list-none space-y-3">
              <li>
                <Link href="/#industries" className="text-white/70 text-sm hover:text-white transition-colors">
                  Drones & Robotics
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-white/70 text-sm hover:text-white transition-colors">
                  Beauty & Aesthetics
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-white/70 text-sm hover:text-white transition-colors">
                  Chemical & Materials
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-white/70 text-sm hover:text-white transition-colors">
                  Fashion & Textiles
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-white/70 text-sm hover:text-white transition-colors">
                  AV & Electronics
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-amber mb-6">
              Company
            </h4>
            <ul className="list-none space-y-3 mb-8">
              <li>
                <Link href="/about" className="text-white/70 text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#howitworks" className="text-white/70 text-sm hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-white/70 text-sm hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/enquiry" className="text-white/70 text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            {/* Contact info */}
            <div className="text-sm text-white/50 space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Adelaide Office</p>
                <p className="text-white/60">5/54 Melbourne St<br />North Adelaide SA 5006</p>
              </div>
              <div>
                <a href="mailto:mark@winningadventure.com.au" className="text-white/60 hover:text-amber transition-colors">
                  mark@winningadventure.com.au
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-xs">© 2026 Winning Adventure Global. All rights reserved.</span>
          <div className="flex items-center gap-6 text-white/40 text-xs">
            <span>ABN: 30 659 034 919</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
