'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const steps = {
  identity: [
    'Extracting facial biometrics',
    'Running liveness detection',
    'Cross-matching ID document',
    'Checking deepfake signals',
    'Running GPS metadata analysis',
    'Generating trust score'
  ],
  credential: [
    'Extracting document fields via OCR',
    'Validating institution patterns',
    'Checking seal and watermark integrity',
    'Cross-referencing issuer database',
    'Generating trust score'
  ],
  payroll: [
    'Parsing roster data',
    'Running duplicate detection',
    'Checking attendance vs payment records',
    'Running statistical outlier scoring',
    'Flagging anomalies',
    'Generating trust score'
  ]
}

export default function ScanningPage() {
  const router = useRouter()
  const { type } = useParams()
  const [currentStep, setCurrentStep] = useState(0)
  const claimSteps = steps[type] || steps.identity

  useEffect(() => {
    if (currentStep < claimSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      // all steps done, go to result page
      // passing a mock score via query param — replace with real AI score later
      const mockScore = 88
      setTimeout(() => {
        router.push(`/verify/${type}/result?score=${mockScore}`)
      }, 800)
    }
  }, [currentStep])

  return (
    <div className="pt-24 pb-32 px-4 max-w-[1280px] mx-auto">
      <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-6 overflow-hidden relative">
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 opacity-10 brand-gradient"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline-md font-semibold">Analyzing Data...</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:200ms]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:400ms]"></div>
            </div>
          </div>

          <div className="space-y-4">
            {claimSteps.map((step, index) => {
              const isDone = index < currentStep
              const isActive = index === currentStep
              const isPending = index > currentStep

              return (
                <div
                  key={step}
                  className={`flex items-center gap-6 p-3 rounded-lg border transition-all duration-500
                    ${isDone ? 'bg-surface/10 border-white/20' : ''}
                    ${isActive ? 'bg-surface/10 border-white/20' : ''}
                    ${isPending ? 'opacity-40' : ''}
                  `}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-green-400">
                      check_circle
                    </span>
                  )}
                  {isActive && (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  )}
                  {isPending && (
                    <span className="material-symbols-outlined opacity-60">
                      pending
                    </span>
                  )}

                  <div className="flex-1">
                    <p className="text-label-md uppercase opacity-60">
                      Step {index + 1}
                    </p>
                    <p className="text-body-md">{step}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}