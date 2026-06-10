'use client'

import { usePathname } from 'next/navigation'
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/payments': 'Payments',
  '/invoices': 'Invoices',
  '/staff': 'Staff',
  '/attendance': 'Attendance',
  '/vendors': 'Vendors',
  '/settings': 'Settings',
}

export default function TopBar() {
  const pathname = usePathname()

  const title = Object.entries(pageTitles).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )?.[1] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 lg:px-8">
      <h1 className="text-[20px] font-bold text-[#111827] tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Search (desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] rounded-lg w-[220px]">
          <HiOutlineMagnifyingGlass size={16} className="text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
          <HiOutlineBell size={20} className="text-[#6B7280]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[13px] font-bold text-primary">
          AO
        </div>
      </div>
    </header>
  )
}
