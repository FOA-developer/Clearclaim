'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import IdentityForm    from '@/components/verify/IdentifyForm'
import CredentialForm  from '@/components/verify/CrendentialForm'
import PayrollForm     from '@/components/verify/PayrollForm'
import SquadPaymentStep from '@/components/verify/SquadPaymentStep'

// ─── Meta per claim type ──────────────────────────────────────────────────────

const CLAIM_META = {
  identity:   { title: 'Identity Claim',   icon: 'badge',        color: '#7B1FA2', description: 'Verify identity with government-issued documents.' },
  credential: { title: 'Credential Claim', icon: 'history_edu',  color: '#C2185B', description: 'Validate professional licences and certifications.' },
  payroll:    { title: 'Payroll Claim',    icon: 'receipt_long', color: '#F4511E', description: 'Confirm income history and employer authenticity.' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyTypePage() {
  const router = useRouter()
  const { type }  = useParams()
  const [stage, setStage] = useState('form') // 'form' | 'payment'

  const meta = CLAIM_META[type] || CLAIM_META.identity

  // Form submitted → move to payment stage
  const handleFormSubmit = () => setStage('payment')

  // Payment confirmed → enter AI scanning
  const handlePaymentSuccess = () => router.push(`/verify/${type}/scanning`)

  // Pick the right form component based on route param
  const FormComponent =
    type === 'credential' ? CredentialForm :
    type === 'payroll'    ? PayrollForm    :
                            IdentityForm

  return (
    <div className="pt-24 pb-32 px-4 max-w-[1280px] mx-auto">

      {/* ── Stage: Verification Form ─────────────────── */}
      {stage === 'form' && (
        <>
          {/* Claim type header */}
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}18` }}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ color: meta.color, fontVariationSettings: "'FILL' 1" }}
              >
                {meta.icon}
              </span>
            </div>
            <div>
              <h1 className="text-headline-lg font-bold">{meta.title}</h1>
              <p className="text-body-sm text-on-surface-variant">{meta.description}</p>
            </div>
          </div>

          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-label-md text-on-surface-variant">
            <StepPill n={1} label="Claim Details" active />
            <span className="w-6 h-px bg-outline-variant" />
            <StepPill n={2} label="Payment" />
            <span className="w-6 h-px bg-outline-variant" />
            <StepPill n={3} label="AI Scan" />
          </div>

          {/* Form card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8">
            <FormComponent onSubmit={handleFormSubmit} />
          </div>
        </>
      )}

      {/* ── Stage: Squad Payment ─────────────────────── */}
      {stage === 'payment' && (
        <>
          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-label-md text-on-surface-variant">
            <StepPill n={1} label="Claim Details" done />
            <span className="w-6 h-px bg-primary" />
            <StepPill n={2} label="Payment" active />
            <span className="w-6 h-px bg-outline-variant" />
            <StepPill n={3} label="AI Scan" />
          </div>

          <SquadPaymentStep
            selectedClaim={meta.title}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </div>
  )
}

// ── Breadcrumb pill ───────────────────────────────────────────────────────────

function StepPill({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
          done   ? 'brand-gradient text-white'
          : active ? 'bg-primary text-white'
          : 'bg-surface-container-high text-on-surface-variant'
        }`}
      >
        {done ? '✓' : n}
      </span>
      <span className={active || done ? 'text-on-surface font-semibold' : ''}>
        {label}
      </span>
    </div>
  )
}