'use client'

import { useState } from 'react'

const WEBHOOK_PENDING = `{
  "event": "payment.pending",
  "status": "awaiting_confirmation",
  "claim_processing": "paused"
}`

const WEBHOOK_CONFIRMED = `{
  "event": "payment.successful",
  "status": "confirmed",
  "claim_processing": "started"
}`

export default function SquadPaymentStep({ selectedClaim, onPaymentSuccess }) {
  // 'idle' → 'processing' → 'confirmed'
  const [status, setStatus] = useState('idle')

  const isProcessing = status === 'processing'
  const isConfirmed  = status === 'confirmed'

  const handlePay = () => {
    if (isProcessing || isConfirmed) return
    setStatus('processing')

    // Step 1 — show "confirmed" badge + update terminal after 2s
    setTimeout(() => {
      setStatus('confirmed')

      // Step 2 — transition to AI scanning after another 1.8s
      setTimeout(() => {
        onPaymentSuccess()
      }, 1800)
    }, 2000)
  }

  return (
    <section className="w-full max-w-3xl mx-auto">

      {/* ── Main card ────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">₦</span>
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">
            Secure Verification Payment
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Pay the verification fee to begin AI-powered claim analysis.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-surface-container-low rounded-xl p-5 space-y-4 mb-6">
          <SummaryRow label="Claim Type"         value={selectedClaim || 'Identity Claim'} />
          <SummaryRow label="Verification Fee"   value="₦1,500"                           bold />
          <SummaryRow label="Processing Partner" value="Squad"                             />
          <div className="flex justify-between items-center gap-4">
            <span className="text-body-sm text-on-surface-variant">Payment Status</span>
            {isConfirmed ? (
              <span className="px-3 py-1 text-label-md font-bold rounded-full bg-green-100 text-green-700 transition-all duration-500">
                Confirmed ✓
              </span>
            ) : (
              <span className="px-3 py-1 text-label-md font-bold rounded-full bg-amber-100 text-amber-700">
                {isProcessing ? 'Processing…' : 'Pending'}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          id="squad-pay-btn"
          onClick={handlePay}
          disabled={isProcessing || isConfirmed}
          className={`w-full py-4 rounded-xl text-white text-headline-sm font-semibold flex items-center justify-center gap-3
            brand-gradient shadow-lg
            hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          {isProcessing && (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isConfirmed && (
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          )}
          {isProcessing ? 'Confirming Payment…' : isConfirmed ? 'Payment Confirmed' : 'Pay with Squad'}
        </button>

        <p className="text-body-sm text-on-surface-variant text-center mt-4">
          Your claim will only be processed after payment confirmation.
        </p>

        {/* ── Webhook Terminal ──────────────────────── */}
        <div className="mt-6 bg-[#0F0F1A] rounded-xl p-4 overflow-x-auto border border-[#1e1e2e]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-md text-[#6b7280] uppercase tracking-widest">
              Squad Webhook Preview
            </p>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-700 ${
                  isConfirmed ? 'bg-[#27c93f]' : 'bg-[#3d3d3d]'
                }`}
              />
            </div>
          </div>

          <pre
            className={`text-xs md:text-sm font-mono transition-colors duration-700 whitespace-pre-wrap ${
              isConfirmed ? 'text-[#27c93f]' : 'text-[#4ade80]/70'
            }`}
          >
            {isConfirmed ? WEBHOOK_CONFIRMED : WEBHOOK_PENDING}
          </pre>

          {/* Live status indicator */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isProcessing
                  ? 'bg-amber-400 animate-pulse'
                  : isConfirmed
                  ? 'bg-[#27c93f]'
                  : 'bg-[#4ade80]/50 animate-pulse'
              }`}
            />
            <span className="text-[11px] font-mono text-[#6b7280]">
              {isProcessing
                ? 'Awaiting Squad webhook response…'
                : isConfirmed
                ? 'Payment confirmed — launching AI analysis'
                : 'Listening on POST /webhooks/squad…'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Small helper row component
function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span className={`text-body-sm text-on-surface ${bold ? 'font-bold' : 'font-semibold'}`}>
        {value}
      </span>
    </div>
  )
}
