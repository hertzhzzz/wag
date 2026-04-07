'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(15,45,94,0.08)] py-2 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto w-full flex items-center">
        <Link href="/" className="flex-shrink-0 h-10 md:h-12 w-[120px] md:w-[150px]">
          <Image src="/logo-nav-trans.png" alt="Winning Adventure Global" width={300} height={60} className="w-full h-full object-none" priority />
        </Link>

        <ul className="hidden md:flex gap-9 list-none flex-1 justify-center">
          <li>
            <Link href="/" className="nav-link text-navy">Home</Link>
          </li>
          <li>
            <Link href="/services" className="nav-link text-navy">Services</Link>
          </li>
          <li>
            <Link href="/resources" className="nav-link text-navy">Resources</Link>
          </li>
          <li>
            <Link href="/about" className="nav-link text-navy">About Us</Link>
          </li>
          <li>
            <Link href="/enquiry" className="nav-link text-navy">Enquiry</Link>
          </li>
        </ul>

        <div className="hidden md:flex gap-3">
          <a
            href="tel:+61416588198"
            className="flex flex-col items-start px-[14px] py-[8px] text-navy bg-white/80 border border-navy/20 hover:bg-navy hover:text-white flex-shrink-0 transition-all leading-tight"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide">Call Us Today</span>
            <span className="text-[13px] font-semibold">+61 0416588198</span>
          </a>
          <Link
            href="/enquiry"
            className="text-[13px] font-medium px-[22px] py-[9px] text-white bg-navy flex-shrink-0 shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all"
          >
            Start Your Factory Tour →
          </Link>
        </div>

        <button
          className="md:hidden ml-auto border-0 cursor-pointer min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-white text-navy shadow-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 h-screen bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in menu */}
      <div
        id="mobile-menu"
        className={`fixed right-0 top-0 min-h-screen w-64 bg-white z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-navy font-medium">Menu</span>
          <button
            className="min-h-11 min-w-11 flex items-center justify-center text-navy"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>
        <ul className="flex flex-col gap-2 p-4 list-none">
          <li>
            <Link
              href="/"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/resources"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Resources
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/enquiry"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Enquiry
            </Link>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .nav-link {
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
          position: relative;
          padding-bottom: 4px;
          color: #0F2D5E;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #0F2D5E;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  )
}
