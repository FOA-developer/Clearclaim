'use client'

import {
  HiOutlineCloudArrowUp,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineRocketLaunch,
} from 'react-icons/hi2'
import FadeIn, { StaggerContainer, StaggerItem } from './FadeIn'

const STEPS = [
  {
    num: '01',
    icon: HiOutlineCloudArrowUp,
    title: 'Connect',
    desc: 'Sign up and connect your bank accounts, payroll provider, or import your employee roster. Takes under 10 minutes.',
  },
  {
    num: '02',
    icon: HiOutlineAdjustmentsHorizontal,
    title: 'Configure',
    desc: 'Set up approval workflows, payment schedules, and department structures. We adapt to how your team already works.',
  },
  {
    num: '03',
    icon: HiOutlineRocketLaunch,
    title: 'Go Live',
    desc: 'Start processing payroll, managing vendors, and tracking attendance — all from one dashboard, the same day.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#F9FAFB]" id="how-it-works">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-3">How It Works</p>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-4">
            Up and running in a day
          </h2>
          <p className="text-[16px] text-[#6B7280] max-w-lg mx-auto">
            No six-month implementation. No consultants. Three steps and you are live.
          </p>
        </FadeIn>

        <FadeIn className="hidden md:flex justify-center mb-16" delay={0.1}>
          <ProcessIllustration />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12" staggerDelay={0.12}>
          {STEPS.map((step, i) => (
            <StaggerItem key={step.num}>
              <div className="relative text-center md:text-left">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-[#E5E7EB]" />
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] text-primary mb-5">
                  <step.icon size={22} />
                </div>
                <div className="text-[12px] font-bold uppercase tracking-widest text-[#C4B5FD] mb-2">{step.num}</div>
                <h3 className="text-[20px] font-semibold text-[#111827] mb-3">{step.title}</h3>
                <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-xs mx-auto md:mx-0">{step.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

function ProcessIllustration() {
  return (
    <svg width="600" height="64" viewBox="0 0 600 64" fill="none" aria-hidden="true">
      <circle cx="60" cy="32" r="24" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <circle cx="60" cy="32" r="8" fill="#4f378a" opacity="0.2" />
      <line x1="84" y1="32" x2="216" y2="32" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="6 4" />
      <polygon points="212,28 220,32 212,36" fill="#D1D5DB" />
      <circle cx="240" cy="32" r="24" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <rect x="230" y="26" width="20" height="3" rx="1.5" fill="#4f378a" opacity="0.2" />
      <rect x="230" y="33" width="20" height="3" rx="1.5" fill="#4f378a" opacity="0.15" />
      <line x1="264" y1="32" x2="396" y2="32" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="6 4" />
      <polygon points="392,28 400,32 392,36" fill="#D1D5DB" />
      <circle cx="420" cy="32" r="24" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <path d="M412 32L418 38L428 26" stroke="#4f378a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <line x1="444" y1="32" x2="520" y2="32" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
      <rect x="524" y="20" width="64" height="24" rx="12" fill="#10B981" opacity="0.1" />
      <text x="556" y="36" textAnchor="middle" fontSize="11" fontWeight="600" fill="#10B981" opacity="0.7">LIVE</text>
    </svg>
  )
}
