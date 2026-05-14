'use client'

import { useRouter } from 'next/navigation'

const claimTypes = [
  {
    type: 'identity',
    icon: 'badge',
    title: 'Identity',
    description: 'Verify your official government-issued documentation.',
    ring: '#7B1FA2'
  },
  {
    type: 'credential',
    icon: 'history_edu',
    title: 'Credential',
    description: 'Validate professional licenses and certifications.',
    ring: '#C2185B'
  },
  {
    type: 'payroll',
    icon: 'receipt_long',
    title: 'Payroll',
    description: 'Confirm income history and employer authenticity.',
    ring: '#F4511E'
  }
]

export default function VerifyPage() {
  const router = useRouter()

  return (
    <div className="pt-24 pb-32 px-4 max-w-[1280px] mx-auto">
      <h1 className="text-headline-lg font-bold mb-2">Start Verification</h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        Select the verification type to begin your claim process.
      </p>

      <div className="space-y-6">
        {claimTypes.map(({ type, icon, title, description, ring }) => (
          <button
            key={type}
            onClick={() => router.push(`/verify/${type}`)}
            style={{ '--ring-color': ring }}
            className="w-full group text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex items-center gap-6 transition-all hover:border-transparent hover:ring-2 active:scale-95"
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${ring}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-surface-container">
              <span
                className="material-symbols-outlined text-4xl brand-gradient-text"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-headline-sm font-semibold">{title}</h3>
              <p className="text-body-sm text-on-surface-variant">{description}</p>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}