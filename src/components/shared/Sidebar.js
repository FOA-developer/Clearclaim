'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineInboxStack,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

const mainNav = [
  { href: '/dashboard', label: 'Home', icon: HiOutlineHome },
  { href: '/payments', label: 'Payments', icon: HiOutlineBanknotes },
  { href: '/invoices', label: 'Invoices', icon: HiOutlineDocumentText },
  { href: '/staff', label: 'Staff', icon: HiOutlineUsers },
  { href: '/vendors', label: 'Vendors', icon: HiOutlineInboxStack },
]

const otherNav = [
  { href: '/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-[#E5E7EB] flex flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-[#E5E7EB]">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="8" fill="#4f378a" />
          <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[17px] font-bold text-[#111827] tracking-tight">ClearClaim</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] rounded-lg">
          <HiOutlineMagnifyingGlass size={16} className="text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
          />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-2 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          Main menu
        </p>
        <ul className="space-y-0.5">
          {mainNav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3F0FF] text-primary'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-[#6B7280]'} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="px-3 pt-5 pb-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          Other
        </p>
        <ul className="space-y-0.5">
          {otherNav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3F0FF] text-primary'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-[#6B7280]'} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-[#E5E7EB] pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#374151] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors w-full"
        >
          <HiOutlineArrowRightOnRectangle size={20} className="text-[#6B7280]" />
          Log out
        </button>
      </div>
    </aside>
  )
}
