'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Static Data ──────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    id: 'released',
    icon: 'payments',
    iconColor: 'text-primary',
    accentClass: 'bg-gradient-to-b from-[#7B1FA2] to-[#C2185B]',
    badge: '+12.5%',
    label: 'Total Released',
    value: '$1,284,500.00',
  },
  {
    id: 'blocked',
    icon: 'block',
    iconColor: 'text-error',
    accentClass: 'bg-error',
    badge: null,
    label: 'Blocked',
    value: '$42,350.00',
  },
  {
    id: 'held',
    icon: 'pause_circle',
    iconColor: 'text-tertiary',
    accentClass: 'bg-tertiary',
    badge: null,
    label: 'Held In Escrow',
    value: '$158,900.00',
  },
]

const LEDGER_ROWS = [
  {
    id: '#TXN-90281',
    date: 'Oct 24, 2023',
    recipient: 'Acme Corp Solutions',
    amount: '$12,450.00',
    status: 'released',
  },
  {
    id: '#TXN-90282',
    date: 'Oct 24, 2023',
    recipient: 'Vanguard Logistics',
    amount: '$8,200.00',
    status: 'blocked',
  },
  {
    id: '#TXN-90283',
    date: 'Oct 23, 2023',
    recipient: 'Global Freight Inc.',
    amount: '$45,000.00',
    status: 'held',
  },
  {
    id: '#TXN-90280',
    date: 'Oct 23, 2023',
    recipient: 'Pinnacle Health Group',
    amount: '$7,850.00',
    status: 'released',
  },
  {
    id: '#TXN-90279',
    date: 'Oct 22, 2023',
    recipient: 'Meridian Technologies',
    amount: '$21,000.00',
    status: 'held',
  },
]

const INITIAL_LOGS = [
  {
    id: 1,
    timestamp: '2023-10-24 14:02:11',
    type: 'EVENT',
    typeColor: 'text-[#569cd6]',
    event: '"payment.released"',
    payload: `{
  "id": "evt_1NxP9jLkd6m",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1698156131,
  "data": {
    "object": {
      "id": "txn_90281",
      "amount": 1245000,
      "currency": "usd",
      "status": "succeeded"
    }
  },
  "type": "payment_intent.succeeded"
}`,
  },
  {
    id: 2,
    timestamp: '2023-10-24 13:58:45',
    type: 'ERROR',
    typeColor: 'text-[#f44747]',
    event: '"payment.blocked"',
    payload: `{
  "id": "evt_1NxP8kMkd2p",
  "object": "event",
  "type": "charge.failed",
  "reason": "risk_assessment_failed",
  "risk_score": 98
}`,
  },
]

const LIVE_EVENTS = [
  {
    id: 3,
    timestamp: '2023-10-24 14:08:33',
    type: 'EVENT',
    typeColor: 'text-[#569cd6]',
    event: '"payment.held"',
    payload: `{
  "id": "evt_1NxPAmkd9f",
  "type": "payment_intent.processing",
  "data": { "id": "txn_90283", "status": "escrow_pending" }
}`,
  },
  {
    id: 4,
    timestamp: '2023-10-24 14:11:02',
    type: 'INFO',
    typeColor: 'text-[#dcdcaa]',
    event: '"trust.score.computed"',
    payload: `{
  "claim_id": "CLM-88291",
  "trust_score": 94,
  "verdict": "PASS",
  "latency_ms": 312
}`,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status) {
  switch (status) {
    case 'released':
      return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase">Released</span>
    case 'blocked':
      return <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[11px] font-bold uppercase">Blocked</span>
    case 'held':
      return <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[11px] font-bold uppercase">Held</span>
    default:
      return null
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ card }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant relative overflow-hidden hover:-translate-y-1 transition-transform duration-200">
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${card.accentClass}`} />

      <div className="flex justify-between items-start mb-4">
        <span
          className={`material-symbols-outlined ${card.iconColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {card.icon}
        </span>
        {card.badge && (
          <span className="text-label-md text-primary bg-primary-fixed px-2 py-1 rounded-full">
            {card.badge}
          </span>
        )}
      </div>

      <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
        {card.label}
      </p>
      <p className="text-headline-lg font-bold text-on-background">{card.value}</p>
    </div>
  )
}

function WebhookLog({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <section className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] shadow-2xl">
      {/* Terminal title bar */}
      <div className="px-4 py-2 bg-[#2d2d2d] flex items-center justify-between border-b border-[#333]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-[11px] font-mono text-[#888] uppercase tracking-widest">
          Webhook Terminal v2.4
        </div>
        <span className="material-symbols-outlined text-[14px] text-[#888]">terminal</span>
      </div>

      {/* Log body */}
      <div
        className="p-6 font-mono text-[13px] leading-relaxed overflow-y-auto max-h-[340px]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#494551 transparent' }}
      >
        {logs.map((log) => (
          <div key={log.id} className="mb-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#b5cea8]">[{log.timestamp}]</span>
              <span className={`font-bold ${log.typeColor}`}>{log.type}:</span>
              <span className="text-[#ce9178]">{log.event}</span>
            </div>
            <pre className="mt-2 text-[#d4d4d4] bg-[#252526] p-3 rounded border border-[#333] overflow-x-auto whitespace-pre-wrap break-words">
              {log.payload}
            </pre>
          </div>
        ))}

        {/* Live cursor */}
        <div className="flex items-center gap-2 text-[#27c93f] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#27c93f] inline-block" />
          <span>Listening for events...</span>
        </div>

        <div ref={bottomRef} />
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [liveIndex, setLiveIndex] = useState(0)

  // Simulate live webhook events trickling in every 8 seconds
  useEffect(() => {
    if (liveIndex >= LIVE_EVENTS.length) return
    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, LIVE_EVENTS[liveIndex]])
      setLiveIndex((i) => i + 1)
    }, 8000)
    return () => clearTimeout(timer)
  }, [liveIndex])

  return (
    <main className="pt-24 px-4 md:px-6 max-w-[1280px] mx-auto space-y-6 pb-32">

      {/* Page Header */}
      <section>
        <h1 className="text-headline-lg font-bold text-on-background">Squad Payments</h1>
        <p className="text-body-md text-on-surface-variant">
          Real-time ledger and transaction processing terminal.
        </p>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>

      {/* Transaction Ledger */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        {/* Ledger header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-headline-sm font-semibold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            Transaction Ledger
          </h2>
          <div className="flex gap-1">
            <button
              id="ledger-filter"
              className="p-2 hover:bg-surface-variant rounded-full transition-colors"
              title="Filter"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">filter_list</span>
            </button>
            <button
              id="ledger-download"
              className="p-2 hover:bg-surface-variant rounded-full transition-colors"
              title="Download"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">download</span>
            </button>
          </div>
        </div>

        {/* Table — scrollable on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-surface-container text-on-surface-variant text-label-md uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Transaction ID</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Recipient</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm">
              {LEDGER_ROWS.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-primary font-bold">{row.id}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-on-surface">{row.recipient}</td>
                  <td className="px-6 py-4 text-right font-bold text-on-surface">{row.amount}</td>
                  <td className="px-6 py-4 text-center">{statusBadge(row.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="hover:bg-surface-container-high rounded-full p-1 transition-colors">
                      <span className="material-symbols-outlined text-outline text-[20px]">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Webhook Terminal */}
      <WebhookLog logs={logs} />
    </main>
  )
}
