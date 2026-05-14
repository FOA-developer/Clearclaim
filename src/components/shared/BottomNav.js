'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/verify', icon: 'add_moderator', label: 'Verify' },
  { href: '/review', icon: 'rate_review', label: 'Review' },
  { href: '/claims', icon: 'list_alt', label: 'Claims' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-surface/80 backdrop-blur-md border-t border-outline-variant rounded-t-xl md:hidden">
      {navItems.map(({ href, icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center rounded-xl transition-all p-2 relative
              ${isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant opacity-70 hover:bg-surface-container-high'
              }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="text-label-md mt-1">{label}</span>

            {/* Active dot indicator */}
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full brand-gradient"></span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}