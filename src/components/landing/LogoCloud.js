'use client'

import FadeIn from './FadeIn'

const COMPANIES = [
  'Dangote Group',
  'Flutterwave',
  'Andela',
  'PiggyVest',
  'Paystack',
  'Kuda Bank',
  'Moniepoint',
  'Interswitch',
]

export default function LogoCloud() {
  return (
    <section className="py-16 px-4 border-y border-[#F3F4F6]">
      <div className="max-w-[1280px] mx-auto text-center">
        <FadeIn>
          <p className="text-[13px] font-medium uppercase tracking-widest text-[#9CA3AF] mb-10">
            Trusted by 500+ businesses across Africa
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
            {COMPANIES.map((name) => (
              <span
                key={name}
                className="text-[15px] md:text-[17px] font-semibold text-[#D1D5DB] select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
