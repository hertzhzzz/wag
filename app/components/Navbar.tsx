'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import PhoneCallLink from '@/components/PhoneCallLink'
import ServicesMegaMenu from '@/components/ServicesMegaMenu'
import { servicesMenu } from '@/data/nav-links'

export default function Navbar({ rightContent }: { rightContent?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

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
    <nav
      className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(15,45,94,0.08)] py-2 transition-all duration-300"
      onMouseLeave={() => setServicesOpen(false)}
    >
      <div className="max-w-[1400px] mx-auto w-full flex items-center">
        <Link href="/" className="flex-shrink-0 h-10 w-[200px] md:h-12 md:w-[240px] relative">
          <Image src="/logos/logo-nav-trans.png" alt="Winning Adventure Global" fill sizes="(max-width: 768px) 200px, 240px" className="object-contain" priority />
        </Link>

        <ul className="hidden md:flex gap-9 list-none flex-1 justify-center">
          <li>
            <Link href="/" className="nav-link text-navy">Home</Link>
          </li>
          <li onMouseEnter={() => setServicesOpen(true)} className="flex items-center gap-1">
            <Link
              href="/services"
              className="nav-link text-navy"
              aria-haspopup="true"
              aria-expanded={servicesOpen}
            >
              Services
            </Link>
            <ChevronDown
              size={14}
              className={`text-navy/40 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
            />
          </li>
          <li>
            <Link href="/article" className="nav-link text-navy">Articles</Link>
          </li>
          <li>
            <Link href="/about" className="nav-link text-navy">About Us</Link>
          </li>
          <li>
            <Link href="/enquiry" className="nav-link text-navy">Enquiry</Link>
          </li>
        </ul>

        <div className="hidden md:flex gap-3">
          {rightContent !== undefined ? rightContent : (
            <>
              <PhoneCallLink
                className="flex flex-col items-start px-[14px] py-[8px] text-navy bg-white/80 border border-navy/20 hover:bg-navy hover:text-white flex-shrink-0 transition-all leading-tight"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide">Call Us Today</span>
                <span className="text-[13px] font-semibold">0416 588 198</span>
              </PhoneCallLink>
              <Link
                href="/enquiry"
                className="text-[13px] font-medium px-[22px] py-[9px] text-white bg-navy flex-shrink-0 shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all"
              >
                Book Free Consult
              </Link>
            </>
          )}
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

      {/* Desktop mega menu */}
      {servicesOpen && (
        <div className="hidden md:block">
          <ServicesMegaMenu onNavigate={() => setServicesOpen(false)} />
        </div>
      )}

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
            <button
              type="button"
              className="w-full min-h-11 px-4 flex items-center justify-between text-navy"
              onClick={() => setMobileServicesOpen((v) => !v)}
              aria-expanded={mobileServicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileServicesOpen && (
              <ul className="flex flex-col list-none pl-4 border-l border-navy/10 ml-4">
                <li>
                  <Link
                    href="/services"
                    className="block min-h-11 px-4 flex items-center text-navy text-[14px]"
                    onClick={handleLinkClick}
                  >
                    All Services Overview
                  </Link>
                </li>
                {servicesMenu
                  .flatMap((col) => col.links)
                  .filter((l) => l.live && l.href !== '/services')
                  .map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="block min-h-11 px-4 flex items-center text-navy text-[14px]"
                        onClick={handleLinkClick}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/article"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Articles
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
