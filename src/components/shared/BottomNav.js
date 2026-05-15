'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineHome,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'

const navItems = [
  { href: '/dashboard', icon: HiOutlineHome, label: 'Home' },
  { href: '/payments', icon: HiOutlineBanknotes, label: 'Payments' },
  { href: '/invoices', icon: HiOutlineDocumentText, label: 'Invoices' },
  { href: '/staff', icon: HiOutlineUsers, label: 'Staff' },
  { href: '/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-white/90 backdrop-blur-md border-t border-[#E5E7EB] md:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-[#9CA3AF]'
            }`}
          >
            <Icon size={22} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
