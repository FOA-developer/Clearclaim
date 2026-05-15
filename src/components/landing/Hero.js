'use client'

import Link from 'next/link'
import { HiOutlineArrowRight, HiOutlinePlay } from 'react-icons/hi2'
import FadeIn from './FadeIn'

export default function Hero() {
  return (
    <section className="relative px-4 pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Copy */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F0FF] text-primary text-[13px] font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Built for growing teams
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-[#111827] leading-[1.1] tracking-tight mb-6">
              Run your business
              <br />
              operations in
              <br />
              <span className="text-primary">one place</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-[17px] md:text-[19px] text-[#6B7280] leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
              Payroll, payments, vendor management, and staff operations — streamlined for teams that move fast.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#111827] text-white text-[15px] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#1F2937] transition-colors"
              >
                Get Started Free
                <HiOutlineArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-[#D1D5DB] text-[#374151] text-[15px] font-semibold px-7 py-3.5 rounded-xl hover:border-[#9CA3AF] hover:bg-[#F9FAFB] transition-colors"
              >
                <HiOutlinePlay size={18} />
                See How It Works
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Dashboard Illustration */}
        <FadeIn direction="left" delay={0.3} duration={0.7} className="flex-1 w-full max-w-lg lg:max-w-none">
          <DashboardIllustration />
        </FadeIn>
      </div>
    </section>
  )
}

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 520 380" fill="none" className="w-full h-auto drop-shadow-xl" aria-hidden="true">
      {/* Main Card */}
      <rect x="20" y="20" width="480" height="340" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1" />

      {/* Top Bar */}
      <rect x="20" y="20" width="480" height="48" rx="16" fill="#F9FAFB" />
      <rect x="20" y="52" width="480" height="1" fill="#E5E7EB" />
      <circle cx="48" cy="44" r="6" fill="#4f378a" opacity="0.2" />
      <rect x="64" y="39" width="60" height="10" rx="5" fill="#E5E7EB" />
      <rect x="134" y="39" width="40" height="10" rx="5" fill="#E5E7EB" />
      <rect x="420" y="36" width="56" height="16" rx="8" fill="#4f378a" />
      <rect x="430" y="41" width="36" height="6" rx="3" fill="white" />

      {/* Sidebar */}
      <rect x="20" y="68" width="120" height="292" fill="#F9FAFB" />
      <rect x="140" y="68" width="1" height="292" fill="#E5E7EB" />
      <rect x="36" y="84" width="80" height="8" rx="4" fill="#D1D5DB" />
      <rect x="36" y="104" width="88" height="8" rx="4" fill="#4f378a" opacity="0.15" />
      <rect x="36" y="124" width="64" height="8" rx="4" fill="#D1D5DB" />
      <rect x="36" y="144" width="72" height="8" rx="4" fill="#D1D5DB" />
      <rect x="36" y="164" width="56" height="8" rx="4" fill="#D1D5DB" />

      {/* Stat Cards Row */}
      <rect x="160" y="80" width="100" height="64" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="174" y="94" width="40" height="6" rx="3" fill="#D1D5DB" />
      <rect x="174" y="110" width="56" height="12" rx="4" fill="#111827" opacity="0.8" />
      <rect x="174" y="128" width="32" height="6" rx="3" fill="#10B981" opacity="0.4" />

      <rect x="272" y="80" width="100" height="64" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="286" y="94" width="40" height="6" rx="3" fill="#D1D5DB" />
      <rect x="286" y="110" width="48" height="12" rx="4" fill="#111827" opacity="0.8" />
      <rect x="286" y="128" width="28" height="6" rx="3" fill="#4f378a" opacity="0.3" />

      <rect x="384" y="80" width="100" height="64" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="398" y="94" width="44" height="6" rx="3" fill="#D1D5DB" />
      <rect x="398" y="110" width="52" height="12" rx="4" fill="#111827" opacity="0.8" />
      <rect x="398" y="128" width="36" height="6" rx="3" fill="#F59E0B" opacity="0.4" />

      {/* Chart Area */}
      <rect x="160" y="160" width="224" height="120" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="176" y="176" width="52" height="6" rx="3" fill="#D1D5DB" />
      {/* Chart Bars */}
      <rect x="176" y="248" width="20" height="18" rx="3" fill="#4f378a" opacity="0.15" />
      <rect x="204" y="232" width="20" height="34" rx="3" fill="#4f378a" opacity="0.25" />
      <rect x="232" y="222" width="20" height="44" rx="3" fill="#4f378a" opacity="0.35" />
      <rect x="260" y="210" width="20" height="56" rx="3" fill="#4f378a" opacity="0.5" />
      <rect x="288" y="198" width="20" height="68" rx="3" fill="#4f378a" opacity="0.65" />
      <rect x="316" y="218" width="20" height="48" rx="3" fill="#4f378a" opacity="0.4" />
      <rect x="344" y="206" width="20" height="60" rx="3" fill="#4f378a" opacity="0.8" />

      {/* Table / List */}
      <rect x="396" y="160" width="88" height="120" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="408" y="176" width="40" height="6" rx="3" fill="#D1D5DB" />
      <rect x="408" y="194" width="64" height="6" rx="3" fill="#E5E7EB" />
      <rect x="408" y="210" width="56" height="6" rx="3" fill="#E5E7EB" />
      <rect x="408" y="226" width="60" height="6" rx="3" fill="#E5E7EB" />
      <rect x="408" y="242" width="48" height="6" rx="3" fill="#E5E7EB" />
      <rect x="408" y="258" width="52" height="6" rx="3" fill="#E5E7EB" />

      {/* Bottom Row */}
      <rect x="160" y="296" width="324" height="48" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="184" cy="320" r="10" fill="#4f378a" opacity="0.1" />
      <rect x="202" y="314" width="80" height="6" rx="3" fill="#D1D5DB" />
      <rect x="202" y="326" width="48" height="5" rx="2.5" fill="#E5E7EB" />
      <rect x="420" y="312" width="48" height="16" rx="8" fill="#10B981" opacity="0.15" />
      <rect x="428" y="317" width="32" height="6" rx="3" fill="#10B981" opacity="0.5" />
    </svg>
  )
}
