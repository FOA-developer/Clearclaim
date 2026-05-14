'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/verify',    label: 'VERIFY'    },
  { href: '/review',    label: 'REVIEW'    },
  { href: '/claim',     label: 'CLAIMS'    },
  { href: '/payment.js',  label: 'PAYMENTS'  },
]

export default function TopBar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface border-b border-outline-variant">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified
        </span>
        <span className="text-headline-md font-bold bg-gradient-to-r from-[#7B1FA2] via-[#C2185B] to-[#F4511E] bg-clip-text text-transparent">
          ClearClaim
        </span>
      </div>

      {/* Desktop Nav Links — hidden on mobile */}
      <div className="hidden md:flex fixed top-0 right-20 h-16 items-center gap-8 z-[60]">
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`text-label-md transition-colors pt-1 ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* User Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-igRtE33SIzkmSJtMBGrb4KuhrgFpU4Y2DI9TIUUooNVHG04lAZWnbicZLs6VYmcmQi0AEkL8acRbwwO2zNpW1M4M-Mrm2Se4O8q8OJxLU_JiKU7ahKOgPW7SmwFK9VNLtNxiQI91ScCIopqY6ckwZ20alLwTmDkzWtobL6qtIpyAHk3j2E2RQ_4eG3fbtLSEiVKsDeurQaQsFjQdstxynxmPBwMBe59U-zYn-hmv1GvSacKx13qNcfxcgdoNPZxgyQG-Eiw-Q"
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  )
}