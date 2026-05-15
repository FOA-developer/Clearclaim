'use client'

import FadeIn, { StaggerContainer, StaggerItem } from './FadeIn'

const TESTIMONIALS = [
  {
    quote: 'We cut payroll processing from two days to twenty minutes. Our finance team finally has time for actual finance work.',
    name: 'Amara Okonkwo',
    role: 'CFO',
    company: 'Meridian Logistics',
    initials: 'AO',
  },
  {
    quote: 'Before ClearClaim, attendance tracking was a spreadsheet nightmare. Now our managers just check the dashboard every morning.',
    name: 'David Adeyemi',
    role: 'HR Lead',
    company: 'Coastal Manufacturing',
    initials: 'DA',
  },
  {
    quote: 'Vendor payments used to require three approvals and a phone call. Now it is one click with a full audit trail. That is the difference.',
    name: 'Funmi Balogun',
    role: 'Operations Manager',
    company: 'Greenfield Agritech',
    initials: 'FB',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-3">Testimonials</p>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight">
            Trusted by teams who ship
          </h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between h-full">
                <blockquote className="text-[15px] text-[#374151] leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[13px] font-semibold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">{t.name}</p>
                    <p className="text-[13px] text-[#9CA3AF]">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
