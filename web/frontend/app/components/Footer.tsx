import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 py-14">
          <div>
            <Link href="/">
              <Image src="/logo.png" alt="Winning Adventure Global" width={200} height={25} className="h-10 w-auto max-w-[200px] object-contain mb-2.5" />
            </Link>
            <p className="text-[13px] leading-relaxed text-gray-500 max-w-[260px] mb-5">
              China Business Trip Guide for Australian B2B Businesses. Your factory partners are waiting.
            </p>
            <a
              href="https://www.linkedin.com/company/winning-adventure-global"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Winning Adventure Global on LinkedIn"
              className="inline-flex items-center gap-1.5 text-navy text-[13px] font-medium border border-gray-200 px-3 py-1.5 rounded hover:border-navy hover:bg-blue-50 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-4">
              Services
            </h4>
            <ul className="list-none space-y-2">
              <li>
                <Link href="/services" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Business Discovery Trip
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Procurement Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-4">
              Industries
            </h4>
            <ul className="list-none space-y-2">
              <li>
                <Link href="/#industries" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Drones
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Aesthetics
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Chemical
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  AV Systems
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-4">
              Company
            </h4>
            <ul className="list-none space-y-2">
              <li>
                <Link href="/about" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#howitworks" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/enquiry" className="text-gray-700 text-[13.5px] hover:text-amber transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
            <div className="mt-5 text-xs text-gray-400 leading-relaxed space-y-2">
              <a
                href="https://www.google.com/maps/place/Winning+Adventure+Global/@-34.9062563,138.6059625,17z/data=!4m16!1m9!3m8!1s0x6ab0c9234a2460b1:0x4e46dbce81f63d91!2s5%2F54+Melbourne+St,+North+Adelaide+SA+5006!3b1!8m2!3d-34.9062563!4d138.6085374!10e3!16s%2Fg%2F11q2nhvjsw!3m5!1s0x6ad870f9565fbbb3:0x64f74ad4a0ab7b43!8m2!3d-34.9076802!4d138.6063284!16s%2Fg%2F11yyg4dg4j?entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 no-underline hover:text-navy transition-colors"
              >
                5, 54 Melbourne St<br />
                North Adelaide SA 5006
              </a>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 block mb-0.5">Adelaide Office</span>
                <a href="mailto:mark@winningadventure.com.au" className="text-gray-400 no-underline hover:text-navy transition-colors">
                  mark@winningadventure.com.au
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        <div className="flex items-center justify-between py-4 text-xs text-gray-400 flex-wrap gap-2">
          <span>© 2026 Winning Adventure Global. All rights reserved.</span>
          <span>ABN: 30 659 034 919</span>
        </div>
      </div>
    </footer>
  )
}
