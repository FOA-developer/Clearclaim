'use client'

import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineBuildingStorefront,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2'
import FadeIn, { StaggerContainer, StaggerItem } from './FadeIn'

const FEATURES = [
  {
    icon: HiOutlineBanknotes,
    title: 'Payroll',
    headline: 'Pay your team on time, every time',
    desc: 'Automate salary calculations, tax deductions, and disbursements. One click to run payroll for your entire workforce.',
    illustration: PayrollSVG,
  },
  {
    icon: HiOutlineCreditCard,
    title: 'Payments',
    headline: 'Move money with confidence',
    desc: 'Vendor payments, reimbursements, and transfers — all tracked with full audit trails and approval workflows.',
    illustration: PaymentsSVG,
  },
  {
    icon: HiOutlineBuildingStorefront,
    title: 'Vendor Management',
    headline: 'Every vendor, one dashboard',
    desc: 'Onboard vendors, track contracts, manage invoices, and monitor performance from a single source of truth.',
    illustration: VendorSVG,
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Staff Management',
    headline: 'Your people, organized',
    desc: 'Employee profiles, departments, roles, and documents — all structured and accessible when you need them.',
    illustration: StaffSVG,
  },
  {
    icon: HiOutlineClipboardDocumentCheck,
    title: 'Attendance',
    headline: 'Track attendance without the hassle',
    desc: 'Clock-in, clock-out, leave requests, and overtime — automated tracking that replaces spreadsheets for good.',
    illustration: AttendanceSVG,
  },
  {
    icon: HiOutlineChartBarSquare,
    title: 'Reports & Analytics',
    headline: 'Decisions backed by data',
    desc: 'Real-time dashboards, exportable reports, and trend analysis across payroll, attendance, and spend.',
    illustration: ReportsSVG,
  },
]

export default function ClaimTypes() {
  return (
    <section className="py-20 md:py-28 px-4" id="features">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-3">Features</p>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-4">
            Everything your operations team needs
          </h2>
          <p className="text-[16px] text-[#6B7280] max-w-xl mx-auto">
            Six core modules that replace scattered tools with one calm, reliable system.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {FEATURES.map((f) => {
            const Illustration = f.illustration
            return (
              <StaggerItem key={f.title}>
                <div className="group bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#C4B5FD] hover:shadow-sm transition-all h-full">
                  <div className="w-full h-32 mb-5 bg-[#F9FAFB] rounded-xl flex items-center justify-center overflow-hidden">
                    <Illustration />
                  </div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-primary">
                      <f.icon size={18} />
                    </div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{f.title}</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#111827] mb-2">{f.headline}</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">{f.desc}</p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}

/* ─── Inline SVG Illustrations ────────────────────────────────────────── */

function PayrollSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <rect x="10" y="8" width="120" height="64" rx="8" fill="white" stroke="#E5E7EB" />
      <rect x="20" y="18" width="40" height="6" rx="3" fill="#D1D5DB" />
      <rect x="20" y="30" width="60" height="10" rx="4" fill="#111827" opacity="0.1" />
      <rect x="20" y="46" width="100" height="1" fill="#F3F4F6" />
      <rect x="20" y="54" width="30" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="56" y="54" width="30" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="92" y="54" width="28" height="5" rx="2.5" fill="#10B981" opacity="0.4" />
      <rect x="20" y="64" width="30" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="56" y="64" width="30" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="92" y="64" width="28" height="5" rx="2.5" fill="#4f378a" opacity="0.3" />
    </svg>
  )
}

function PaymentsSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <rect x="20" y="12" width="100" height="56" rx="10" fill="white" stroke="#E5E7EB" />
      <rect x="20" y="12" width="100" height="20" rx="10" fill="#F9FAFB" />
      <rect x="32" y="20" width="28" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="88" y="18" width="24" height="8" rx="4" fill="#4f378a" opacity="0.15" />
      <circle cx="38" cy="48" r="8" fill="#4f378a" opacity="0.08" />
      <rect x="52" y="44" width="40" height="4" rx="2" fill="#D1D5DB" />
      <rect x="52" y="52" width="24" height="4" rx="2" fill="#E5E7EB" />
      <path d="M98 42L104 48L116 36" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  )
}

function VendorSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <rect x="10" y="10" width="56" height="60" rx="8" fill="white" stroke="#E5E7EB" />
      <circle cx="38" cy="30" r="8" fill="#4f378a" opacity="0.1" />
      <rect x="22" y="44" width="32" height="4" rx="2" fill="#D1D5DB" />
      <rect x="26" y="52" width="24" height="4" rx="2" fill="#E5E7EB" />
      <rect x="74" y="10" width="56" height="60" rx="8" fill="white" stroke="#E5E7EB" />
      <circle cx="102" cy="30" r="8" fill="#4f378a" opacity="0.1" />
      <rect x="86" y="44" width="32" height="4" rx="2" fill="#D1D5DB" />
      <rect x="90" y="52" width="24" height="4" rx="2" fill="#E5E7EB" />
      <rect x="24" y="62" width="28" height="5" rx="2.5" fill="#10B981" opacity="0.3" />
      <rect x="88" y="62" width="28" height="5" rx="2.5" fill="#F59E0B" opacity="0.3" />
    </svg>
  )
}

function StaffSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <circle cx="50" cy="28" r="10" fill="#4f378a" opacity="0.08" />
      <circle cx="70" cy="28" r="10" fill="#4f378a" opacity="0.12" />
      <circle cx="90" cy="28" r="10" fill="#4f378a" opacity="0.08" />
      <rect x="30" y="46" width="80" height="28" rx="8" fill="white" stroke="#E5E7EB" />
      <rect x="40" y="54" width="24" height="4" rx="2" fill="#D1D5DB" />
      <rect x="40" y="62" width="16" height="4" rx="2" fill="#E5E7EB" />
      <rect x="82" y="54" width="20" height="12" rx="4" fill="#4f378a" opacity="0.1" />
    </svg>
  )
}

function AttendanceSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <rect x="18" y="8" width="104" height="64" rx="8" fill="white" stroke="#E5E7EB" />
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={28 + col * 13}
            y={24 + row * 12}
            width="9"
            height="8"
            rx="2"
            fill={
              (col === 2 && row === 1) || (col === 4 && row === 2)
                ? '#4f378a'
                : (col === 1 && row === 3)
                  ? '#F59E0B'
                  : '#F3F4F6'
            }
            opacity={(col === 2 && row === 1) || (col === 4 && row === 2) ? 0.25 : (col === 1 && row === 3) ? 0.3 : 1}
          />
        ))
      )}
      <rect x="28" y="14" width="32" height="5" rx="2.5" fill="#D1D5DB" />
    </svg>
  )
}

function ReportsSVG() {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <rect x="14" y="8" width="112" height="64" rx="8" fill="white" stroke="#E5E7EB" />
      <rect x="24" y="16" width="36" height="5" rx="2.5" fill="#D1D5DB" />
      <rect x="24" y="56" width="10" height="10" rx="2" fill="#4f378a" opacity="0.15" />
      <rect x="38" y="46" width="10" height="20" rx="2" fill="#4f378a" opacity="0.25" />
      <rect x="52" y="38" width="10" height="28" rx="2" fill="#4f378a" opacity="0.35" />
      <rect x="66" y="30" width="10" height="36" rx="2" fill="#4f378a" opacity="0.5" />
      <rect x="80" y="42" width="10" height="24" rx="2" fill="#4f378a" opacity="0.3" />
      <rect x="94" y="34" width="10" height="32" rx="2" fill="#4f378a" opacity="0.6" />
      <polyline
        points="29,52 43,40 57,34 71,26 85,38 99,30"
        stroke="#4f378a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
