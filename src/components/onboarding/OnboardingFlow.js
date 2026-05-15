'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineCodeBracket,
  HiOutlineRocketLaunch,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineCurrencyDollar,
  HiOutlineChartBarSquare,
  HiOutlineArrowRight,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'

import {
  COMPANY_SIZES,
  COMPANY_REVENUES,
  SIGNER_ROLES,
} from '@/lib/validation/onboarding'

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner / Director', description: 'Full control of the business', icon: HiOutlineRocketLaunch },
  { value: 'ceo', label: 'CEO', description: 'Leading the organization', icon: HiOutlineUser },
  { value: 'cto', label: 'CTO', description: 'Technology and engineering', icon: HiOutlineCodeBracket },
  { value: 'cfo', label: 'CFO', description: 'Finance and accounting', icon: HiOutlineCurrencyDollar },
  { value: 'hr_manager', label: 'HR Manager', description: 'People and talent operations', icon: HiOutlineUsers },
  { value: 'finance_manager', label: 'Finance Manager', description: 'Payments and reconciliation', icon: HiOutlineBanknotes },
  { value: 'operations_manager', label: 'Operations Manager', description: 'Day-to-day operations', icon: HiOutlineCog6Tooth },
  { value: 'other', label: 'Other', description: 'Tell us in a few words', icon: HiOutlineClipboardDocumentList },
]

const SIZE_OPTIONS = [
  { value: '1-10', label: '1–10', desc: 'Startup / Solo' },
  { value: '11-50', label: '11–50', desc: 'Small team' },
  { value: '51-200', label: '51–200', desc: 'Growing company' },
  { value: '201-500', label: '201–500', desc: 'Mid-market' },
  { value: '501-1000', label: '501–1000', desc: 'Large enterprise' },
  { value: '1000+', label: '1000+', desc: 'Enterprise' },
]

const REVENUE_OPTIONS = [
  { value: 'Under ₦10M', label: 'Under ₦10M', desc: 'Early stage' },
  { value: '₦10M - ₦50M', label: '₦10M – ₦50M', desc: 'Scaling' },
  { value: '₦50M - ₦200M', label: '₦50M – ₦200M', desc: 'Growth' },
  { value: '₦200M - ₦1B', label: '₦200M – ₦1B', desc: 'Established' },
  { value: '₦1B - ₦5B', label: '₦1B – ₦5B', desc: 'Enterprise' },
  { value: 'Above ₦5B', label: 'Above ₦5B', desc: 'Large Enterprise' },
]

const TOTAL_STEPS = 4

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [ownerName, setOwnerName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [signerRole, setSignerRole] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyRevenue, setCompanyRevenue] = useState('')

  function canContinue() {
    if (step === 1) return signerRole.length > 0
    if (step === 2) return ownerName.trim().length >= 2 && companyName.trim().length >= 2
    if (step === 3) return companySize.length > 0
    if (step === 4) return companyRevenue.length > 0
    return false
  }

  async function handleFinish() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          companyName,
          signerRole,
          companySize,
          companyRevenue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Onboarding failed')
      }

      router.push(data.redirectTo || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else handleFinish()
  }

  function back() {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#E5E7EB]">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="px-6 pt-6 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="#4f378a" />
            <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[16px] font-bold text-[#111827] tracking-tight">ClearClaim</span>
        </div>
        <span className="text-[13px] font-medium text-[#9CA3AF] uppercase tracking-widest">
          Step {step} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 pt-8 pb-24 md:pt-12">
        <div className="w-full max-w-2xl">
          {error && (
            <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2.5">
              <HiOutlineExclamationCircle size={18} className="text-[#DC2626] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#991B1B]">{error}</p>
            </div>
          )}

          {step === 1 && (
            <StepContainer
              title="What best describes you?"
              subtitle="We'll tailor your ClearClaim experience to how you work."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    description={opt.description}
                    selected={signerRole === opt.value}
                    onSelect={() => setSignerRole(opt.value)}
                  />
                ))}
              </div>
            </StepContainer>
          )}

          {step === 2 && (
            <StepContainer
              title="Tell us about yourself"
              subtitle="Your name and company help us personalize your workspace."
            >
              <div className="space-y-5">
                <TextInput
                  id="ownerName"
                  label="Your full name"
                  placeholder="e.g. Adebayo Ogunlesi"
                  value={ownerName}
                  onChange={setOwnerName}
                  icon={HiOutlineUser}
                />
                <TextInput
                  id="companyName"
                  label="Company name"
                  placeholder="e.g. Meridian Logistics"
                  value={companyName}
                  onChange={setCompanyName}
                  icon={HiOutlineBuildingOffice2}
                />
              </div>
            </StepContainer>
          )}

          {step === 3 && (
            <StepContainer
              title="How many people work here?"
              subtitle="This helps us recommend the right plan and features."
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    selected={companySize === opt.value}
                    onSelect={() => setCompanySize(opt.value)}
                  />
                ))}
              </div>
            </StepContainer>
          )}

          {step === 4 && (
            <StepContainer
              title="What's your annual revenue?"
              subtitle="Helps us tailor billing, compliance, and reporting features."
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REVENUE_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    icon={HiOutlineChartBarSquare}
                    selected={companyRevenue === opt.value}
                    onSelect={() => setCompanyRevenue(opt.value)}
                  />
                ))}
              </div>
            </StepContainer>
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="text-[14px] font-semibold text-[#111827] hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={!canContinue() || loading}
            className="flex items-center gap-2 py-2.5 px-6 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finishing...
              </span>
            ) : (
              <>
                {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
                <HiOutlineArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepContainer({ title, subtitle, children }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[34px] font-bold text-[#111827] tracking-tight leading-tight mb-2">
        {title}
      </h1>
      <p className="text-[15px] text-[#6B7280] mb-8">{subtitle}</p>
      {children}
    </div>
  )
}

function SelectCard({ icon: Icon, label, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
        selected
          ? 'border-primary bg-[#F3F0FF]'
          : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
      }`}
    >
      {Icon && (
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
            selected ? 'bg-primary/10 text-primary' : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}
        >
          <Icon size={20} />
        </div>
      )}
      <p className="text-[15px] font-semibold text-[#111827]">{label}</p>
      {description && (
        <p className="text-[13px] text-[#6B7280] mt-0.5">{description}</p>
      )}
    </button>
  )
}

function TextInput({ id, label, placeholder, value, onChange, icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-medium text-[#111827] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        )}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
        />
      </div>
    </div>
  )
}
