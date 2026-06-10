'use client'

import { useState } from 'react'
import { HiOutlinePaperAirplane } from 'react-icons/hi2'
import FadeIn from './FadeIn'

export default function CTASection() {
  const [form, setForm] = useState({ name: '', company: '', email: '' })
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="py-20 md:py-28 px-4" id="cta">
      <div className="max-w-[640px] mx-auto text-center">
        <FadeIn>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-4">
            Ready to simplify your operations?
          </h2>
          <p className="text-[16px] text-[#6B7280] mb-10">
            Get a personalized walkthrough of ClearClaim. No commitment, no pressure.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          {submitted ? (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-8">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10L8 14L16 6" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-[#111827] mb-2">Thank you, {form.name.split(' ')[0]}!</h3>
              <p className="text-[15px] text-[#6B7280]">
                We will be in touch within 24 hours to schedule your demo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="demo-name" className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  Full Name
                </label>
                <input
                  id="demo-name"
                  type="text"
                  required
                  placeholder="Adebayo Ogunlesi"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="demo-company" className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  Company
                </label>
                <input
                  id="demo-company"
                  type="text"
                  required
                  placeholder="Your company name"
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="demo-email" className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  Work Email
                </label>
                <input
                  id="demo-email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#111827] text-white text-[15px] font-semibold py-3.5 rounded-xl hover:bg-[#1F2937] transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Request a Demo
                <HiOutlinePaperAirplane size={18} />
              </button>
              <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
                No spam. We will only reach out about your demo request.
              </p>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
