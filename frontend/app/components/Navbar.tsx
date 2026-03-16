'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white h-[72px] flex items-center px-4 md:px-10 border-b border-gray-200 sticky top-0 z-[100]">
      <Link href="/" className="flex-shrink-0">
        <Image src="/logo.png" alt="Winning Adventure Global" width={200} height={25} className="h-9 w-auto" />
      </Link>

      <ul className="hidden md:flex gap-9 list-none flex-1 justify-center">
        <li>
          <Link href="/" className="nav-link">Home</Link>
        </li>
        <li>
          <Link href="/services" className="nav-link">Services</Link>
        </li>
        <li>
          <Link href="/resources" className="nav-link">Resources</Link>
        </li>
        <li>
          <Link href="/about" className="nav-link">About</Link>
        </li>
      </ul>

      <div className="hidden md:flex">
        <Link
          href="/enquiry"
          className="text-[13px] font-medium text-white px-[22px] py-[9px] flex-shrink-0 bg-gradient-to-r from-[#0F2D5E] to-[#1a3d6e] shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all"
        >
          Start Your Factory Tour →
        </Link>
      </div>

      <button
        className="md:hidden ml-auto bg-transparent border-0 text-navy cursor-pointer min-h-11 min-w-11 flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in menu */}
      <div
        id="mobile-menu"
        className={`fixed right-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
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
          color: #0F2D5E;
          text-decoration: none;
          position: relative;
          padding-bottom: 4px;
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
