'use client'

import Link from 'next/link'
import { HiOutlineGlobeAlt } from 'react-icons/hi2'
import FadeIn from './FadeIn'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Request a Demo', href: '#cta' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#cta' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] pt-16 pb-8 px-4" id="about">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect width="28" height="28" rx="8" fill="#4f378a" />
                  <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[18px] font-bold text-[#111827] tracking-tight">ClearClaim</span>
              </Link>
              <p className="text-[14px] text-[#9CA3AF] leading-relaxed mb-6">
                The operations platform for growing businesses. Payroll, payments, vendors, and staff — in one place.
              </p>
              <div className="flex items-center gap-4">
                <SocialIcon href="https://twitter.com" label="Twitter">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.38 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.32 3.91A12.16 12.16 0 013.16 4.86a4.28 4.28 0 001.32 5.71 4.24 4.24 0 01-1.94-.54v.06a4.28 4.28 0 003.43 4.19 4.27 4.27 0 01-1.93.07 4.28 4.28 0 004 2.97A8.58 8.58 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.72 8.72 0 0024 5.56a8.55 8.55 0 01-2.54.7z" />
                </SocialIcon>
                <SocialIcon href="https://linkedin.com" label="LinkedIn">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                </SocialIcon>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#E5E7EB] transition-colors"
                  aria-label="Website"
                >
                  <HiOutlineGlobeAlt size={16} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                <div key={heading}>
                  <h4 className="text-[12px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">{heading}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[#F3F4F6] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[13px] text-[#9CA3AF]">
              &copy; {new Date().getFullYear()} ClearClaim. All rights reserved.
            </p>
            <p className="text-[13px] text-[#9CA3AF]">
              Built in Lagos, for businesses everywhere.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#E5E7EB] transition-colors"
      aria-label={label}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </a>
  )
}
