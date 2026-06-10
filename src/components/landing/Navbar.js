'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="#4f378a" />
            <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[20px] font-bold text-[#111827] tracking-tight">ClearClaim</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="#cta"
            className="bg-[#111827] text-white text-[14px] font-medium px-5 py-2.5 rounded-lg hover:bg-[#1F2937] transition-colors"
          >
            Request a Demo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <HiOutlineXMark size={24} /> : <HiOutlineBars3 size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 pb-6 pt-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-[15px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
            <Link
              href="/login"
              className="text-[15px] font-medium text-[#6B7280] hover:text-[#111827]"
            >
              Log in
            </Link>
            <Link
              href="#cta"
              className="bg-[#111827] text-white text-[15px] font-medium px-5 py-2.5 rounded-lg text-center hover:bg-[#1F2937] transition-colors"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
