'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_CLAIMS = [
  {
    id: 'CLM-88291',
    icon: 'medical_services',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-primary',
    title: 'Health Reimbursement',
    name: 'Johnathan Miller',
    date: 'Oct 24, 2023',
    score: 94,
    status: 'APPROVED',
    expanded: true,
    verdict: 'Automated Approval',
    amount: '$1,450.00',
    payments: [
      { icon: 'payments', iconColor: 'text-primary', label: 'Initial Disbursement', sub: 'Completed • Oct 25', amount: '$725.00', amountColor: 'text-primary' },
      { icon: 'schedule', iconColor: 'text-outline', label: 'Final Settlement', sub: 'Scheduled • Nov 01', amount: '$725.00', amountColor: 'text-on-surface-variant' },
    ],
  },
  {
    id: 'CLM-90124',
    icon: 'directions_car',
    iconBg: 'bg-surface-container-high',
    iconColor: 'text-on-surface-variant',
    title: 'Auto Collision',
    name: 'Sarah Jenkins',
    date: 'Oct 22, 2023',
    score: 62,
    status: 'PENDING REVIEW',
    verdict: 'Awaiting Manual Review',
    amount: '$3,200.00',
    payments: [],
  },
  {
    id: 'CLM-77421',
    icon: 'home_repair_service',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-primary',
    title: 'Property Damage',
    name: 'Robert Chen',
    date: 'Oct 20, 2023',
    score: 88,
    status: 'APPROVED',
    verdict: 'Automated Approval',
    amount: '$5,800.00',
    payments: [
      { icon: 'payments', iconColor: 'text-primary', label: 'Full Settlement', sub: 'Completed • Oct 21', amount: '$5,800.00', amountColor: 'text-primary' },
    ],
  },
  {
    id: 'CLM-66310',
    icon: 'report',
    iconBg: 'bg-error-container',
    iconColor: 'text-error',
    title: 'Travel Disruption',
    name: 'Alice Wong',
    date: 'Oct 18, 2023',
    score: 12,
    status: 'REJECTED',
    verdict: 'Fraud Risk Detected',
    amount: '$890.00',
    payments: [],
  },
  {
    id: 'CLM-55219',
    icon: 'inventory_2',
    iconBg: 'bg-surface-container-high',
    iconColor: 'text-on-surface-variant',
    title: 'Equipment Failure',
    name: 'Marcus Thorne',
    date: 'Oct 15, 2023',
    score: 45,
    status: 'IN REVIEW',
    verdict: 'Pending Expert Assessment',
    amount: '$2,100.00',
    payments: [],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { key: 'ALL', label: 'All Status', icon: 'filter_list' },
  { key: 'PENDING', label: 'Pending', icon: 'pending_actions' },
  { key: 'APPROVED', label: 'Approved', icon: 'check_circle' },
  { key: 'REJECTED', label: 'Rejected', icon: 'cancel' },
  { key: 'IN REVIEW', label: 'In Review', icon: 'history' },
]

function matchesFilter(claim, filter) {
  if (filter === 'ALL') return true
  if (filter === 'PENDING') return claim.status === 'PENDING REVIEW'
  return claim.status === filter
}

function getScoreBadge(score) {
  if (score >= 75) return 'brand-gradient text-white'
  if (score >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-surface-container-high text-on-surface-variant'
}

function getStatusColor(status) {
  if (status === 'APPROVED') return 'text-green-600'
  if (status === 'REJECTED') return 'text-error'
  return 'text-outline'
}

// ─── Components ──────────────────────────────────────────────────────────────

function ClaimCard({ claim, isOpen, onToggle }) {
  const statusColor = getStatusColor(claim.status)
  const scoreBadge = getScoreBadge(claim.score)

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden transition-all duration-300">
      {/* Card Header — always visible, click to toggle */}
      <button
        id={`claim-card-${claim.id}`}
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between text-left active:scale-[0.99] transition-transform duration-200"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${claim.iconBg} flex items-center justify-center ${claim.iconColor} flex-shrink-0`}>
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {claim.icon}
            </span>
          </div>
          <div className="text-left">
            <p className="text-label-md text-outline">ID: {claim.id}</p>
            <h3 className="text-headline-sm text-on-surface">{claim.title}</h3>
            <p className="text-body-sm text-on-surface-variant">{claim.name} • {claim.date}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-label-md font-bold ${scoreBadge}`}>
            Score: {claim.score}
          </span>
          <span className={`text-label-md font-bold ${statusColor}`}>
            {claim.status}
          </span>
          <span className={`material-symbols-outlined text-outline text-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded Detail Panel */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-outline-variant bg-surface-container-low/30">
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-label-md text-outline uppercase tracking-wider">Verdict</p>
                <p className="text-body-md font-semibold text-on-surface">{claim.verdict}</p>
              </div>
              <div>
                <p className="text-label-md text-outline uppercase tracking-wider">Total Amount</p>
                <p className="text-body-md font-semibold text-on-surface">{claim.amount}</p>
              </div>
            </div>

            {claim.payments.length > 0 && (
              <div>
                <p className="text-label-md text-outline uppercase tracking-wider mb-2">
                  Squad Payment Events
                </p>
                <div className="space-y-2">
                  {claim.payments.map((payment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${payment.iconColor}`}>
                          {payment.icon}
                        </span>
                        <div>
                          <p className="text-body-sm font-semibold">{payment.label}</p>
                          <p className="text-label-md text-outline">{payment.sub}</p>
                        </div>
                      </div>
                      <p className={`text-body-sm font-bold ${payment.amountColor}`}>
                        {payment.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {claim.payments.length === 0 && (
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant text-center">
                <p className="text-body-sm text-on-surface-variant">No payment events recorded yet.</p>
              </div>
            )}
          </div>

          <button className="w-full py-2 bg-surface-container-high text-primary text-label-md font-bold rounded-lg hover:bg-surface-dim transition-all">
            View Full Documentation
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [openId, setOpenId] = useState('CLM-88291') // first card open by default

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return ALL_CLAIMS.filter((c) => {
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.date.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      return matchesSearch && matchesFilter(c, activeFilter)
    })
  }, [query, activeFilter])

  return (
    <main className="pt-20 px-4 max-w-[1280px] mx-auto pb-32">

      {/* Page Title */}
      <div className="mt-4 mb-2">
        <h1 className="text-headline-lg font-bold">All Claims</h1>
        <p className="text-body-sm text-on-surface-variant">
          {filtered.length} claim{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none">
          search
        </span>
        <input
          id="claims-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Claim ID, Name, or Date..."
          className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-body-md text-on-surface"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {FILTER_OPTIONS.map(({ key, label, icon }) => {
          const isActive = activeFilter === key
          return (
            <button
              key={key}
              id={`filter-${key.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-label-md whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'brand-gradient text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          )
        })}
      </div>

      {/* Claims List */}
      <section className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">
              search_off
            </span>
            <p className="text-headline-sm text-on-surface-variant">No claims found</p>
            <p className="text-body-sm text-outline mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isOpen={openId === claim.id}
              onToggle={() => setOpenId(openId === claim.id ? null : claim.id)}
            />
          ))
        )}
      </section>

      {/* Floating Action Button */}
      <Link
        href="/verify"
        id="claims-fab"
        className="fixed right-6 bottom-24 w-14 h-14 brand-gradient text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform duration-200 z-40"
        title="New Verification"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </Link>
    </main>
  )
}
