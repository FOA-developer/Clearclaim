'use client'

import { useSearchParams, useParams } from 'next/navigation'

function getVerdict(score) {
  if (score > 70) return 'PASS'
  if (score <= 50) return 'FAIL'
  return 'REVIEW'
}

export default function ResultPage() {
  const { type } = useParams()
  const searchParams = useSearchParams()
  const score = Number(searchParams.get('score')) || 88
  const verdict = getVerdict(score)

  // how much of the ring to fill
  const circumference = 2 * Math.PI * 88
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="pt-24 pb-32 px-4 max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Trust Score Ring */}
        <div className="md:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-label-md uppercase tracking-widest text-on-surface-variant mb-6">
            Confidence Score
          </p>

          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100" cy="100" r="88"
                fill="transparent"
                stroke="#e6e0e9"
                strokeWidth="12"
              />
              {/* Score ring */}
              <circle
                cx="100" cy="100" r="88"
                fill="transparent"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7B1FA2" />
                  <stop offset="50%" stopColor="#C2185B" />
                  <stop offset="100%" stopColor="#F4511E" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-display-lg font-bold brand-gradient-text">
                {score}%
              </span>
              <span className="text-label-md text-on-surface-variant">
                {verdict === 'PASS' ? 'HIGH TRUST' : verdict === 'REVIEW' ? 'MODERATE' : 'LOW TRUST'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-label-md">
              ENCRYPTED
            </span>
            <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-label-md">
              VERIFIED SOURCE
            </span>
          </div>
        </div>

        {/* Squad Action Panel — only shows the relevant verdict block */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            <h3 className="text-headline-sm font-semibold mb-6">Squad Action Panel</h3>

            {verdict === 'PASS' && (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                  <div>
                    <p className="font-semibold text-green-800">Claim Approved</p>
                    <p className="text-body-sm text-green-600">
                      Squad will release funds to the validated recipient immediately.
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 brand-gradient text-white text-label-md rounded-full font-bold">
                  PASS
                </span>
              </div>
            )}

            {verdict === 'REVIEW' && (
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600">
                    schedule
                  </span>
                  <div>
                    <p className="font-semibold text-amber-800">Manual Review Required</p>
                    <p className="text-body-sm text-amber-600">
                      Funds are held in escrow pending human expert review.
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-amber-100 text-amber-800 text-label-md rounded-full font-bold">
                  REVIEW
                </span>
              </div>
            )}

            {verdict === 'FAIL' && (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600">
                    gpp_maybe
                  </span>
                  <div>
                    <p className="font-semibold text-red-800">Claim Rejected</p>
                    <p className="text-body-sm text-red-600">
                      Squad has blocked all outbound transfers. Refund initiated.
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-red-100 text-red-800 text-label-md rounded-full font-bold">
                  FAIL
                </span>
              </div>
            )}

            {/* What happens next */}
            <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
              <p className="text-label-md uppercase tracking-widest text-on-surface-variant mb-2">
                What happens next
              </p>
              {verdict === 'PASS' && (
                <p className="text-body-md text-on-surface-variant">
                  Squad will process the payment release within seconds. You will receive a confirmation webhook with the transaction ID.
                </p>
              )}
              {verdict === 'REVIEW' && (
                <p className="text-body-md text-on-surface-variant">
                  A human reviewer will assess this claim within 24 hours. Funds remain in escrow until a decision is made.
                </p>
              )}
              {verdict === 'FAIL' && (
                <p className="text-body-md text-on-surface-variant">
                  This claim has been flagged as high risk. No funds will be released. Contact support if you believe this is an error.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}