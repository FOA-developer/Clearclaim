'use client'

import Link from 'next/link'
import { HiOutlineCheck } from 'react-icons/hi2'
import FadeIn, { StaggerContainer, StaggerItem } from './FadeIn'

const TIERS = [
  {
    name: 'Starter',
    price: '₦45,000',
    period: '/month',
    desc: 'For small teams getting started with structured operations.',
    features: [
      'Up to 25 employees',
      'Payroll processing',
      'Basic attendance tracking',
      'Staff directory',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₦120,000',
    period: '/month',
    desc: 'For scaling companies that need full operational control.',
    features: [
      'Up to 200 employees',
      'Everything in Starter',
      'Vendor management',
      'Payment approvals & workflows',
      'Reports & analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations with custom compliance and integration needs.',
    features: [
      'Unlimited employees',
      'Everything in Growth',
      'Custom integrations & API',
      'Dedicated account manager',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '#cta',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#F9FAFB]" id="pricing">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-3">Pricing</p>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-[#6B7280] max-w-lg mx-auto">
            Start free for 14 days. No credit card required. Upgrade when you are ready.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerDelay={0.1}>
          {TIERS.map((tier) => (
            <StaggerItem key={tier.name}>
              <div
                className={`relative rounded-2xl p-6 flex flex-col h-full ${
                  tier.highlighted
                    ? 'bg-white border-2 border-primary shadow-lg shadow-primary/5'
                    : 'bg-white border border-[#E5E7EB]'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-[18px] font-semibold text-[#111827] mb-1">{tier.name}</h3>
                  <p className="text-[13px] text-[#9CA3AF] mb-4">{tier.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-bold text-[#111827]">{tier.price}</span>
                    {tier.period && <span className="text-[14px] text-[#9CA3AF]">{tier.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <HiOutlineCheck size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-[14px] text-[#6B7280]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block text-center text-[14px] font-semibold py-3 rounded-xl transition-colors ${
                    tier.highlighted
                      ? 'bg-[#111827] text-white hover:bg-[#1F2937]'
                      : 'border border-[#D1D5DB] text-[#374151] hover:border-[#9CA3AF] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
