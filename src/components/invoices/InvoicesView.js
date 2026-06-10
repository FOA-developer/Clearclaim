'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
  HiOutlinePlus,
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentArrowUp,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineCurrencyDollar,
  HiOutlineBanknotes,
  HiOutlineArrowPath,
} from 'react-icons/hi2'

const FILTERS = ['All', 'Draft', 'Pending', 'Approved', 'Rejected', 'Paid']

/** Common Nigerian bank codes for the Squad dropdown */
const BANK_CODES = [
  ['000013', 'GTBank Plc'],
  ['000014', 'Access Bank'],
  ['000015', 'Zenith Bank Plc'],
  ['000016', 'First Bank of Nigeria'],
  ['000003', 'FCMB'],
  ['000017', 'Wema Bank'],
  ['000018', 'Union Bank'],
  ['000002', 'Keystone Bank'],
  ['000007', 'Fidelity Bank'],
  ['000008', 'Polaris Bank'],
  ['000011', 'Unity Bank'],
  ['000001', 'Sterling Bank'],
  ['000004', 'United Bank for Africa'],
  ['000006', 'JAIZ Bank'],
  ['000010', 'Ecobank Bank'],
  ['000012', 'StanbicIBTC Bank'],
  ['000019', 'Enterprise Bank'],
  ['000020', 'Heritage'],
  ['000021', 'Standard Chartered'],
  ['000023', 'Providus Bank'],
  ['000026', 'Taj Bank'],
  ['000005', 'Diamond Bank'],
  ['000009', 'Citi Bank'],
  ['090267', 'Kuda Microfinance Bank'],
  ['100004', 'Opay Digital Services LTD'],
  ['100033', 'PalmPay Limited'],
  ['000025', 'Titan Trust Bank'],
  ['090325', 'Sparkle'],
]

function formatNaira(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n)
}

function formatDisplayDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Client-side totals mirror POST /api/invoices */
function computePreview(items, discount, whtRate) {
  let subtotal = 0
  let vatAmount = 0
  for (const item of items) {
    const lineSub = Number(item.quantity || 0) * Number(item.unitPrice || 0)
    const vat =
      item.vatApplicable !== false ? lineSub * (Number(item.vatRate ?? 7.5) / 100) : 0
    subtotal += lineSub
    vatAmount += vat
  }
  const d = Number(discount || 0)
  const wht = subtotal * (Number(whtRate || 0) / 100)
  const grandTotal = subtotal - d + vatAmount
  const netPayable = grandTotal - wht
  return { subtotal, vatAmount, grandTotal, netPayable, wht }
}

function filterToStatusParam(label) {
  if (label === 'All') return ''
  return label.toLowerCase()
}

export default function InvoicesView() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [invoices, setInvoices] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [statusCounts, setStatusCounts] = useState(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [uploadOpen, setUploadOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [detailDoc, setDetailDoc] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [filter, debouncedSearch])

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        includeCounts: '1',
      })
      const st = filterToStatusParam(filter)
      if (st) params.set('status', st)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/invoices?${params}`, { credentials: 'include' })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      }

      setInvoices(json.invoices ?? [])
      setPagination(json.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 })
      if (json.statusCounts) setStatusCounts(json.statusCounts)
    } catch (e) {
      setListError(e.message ?? 'Failed to load invoices')
      setInvoices([])
    } finally {
      setListLoading(false)
    }
  }, [page, filter, debouncedSearch])

  useEffect(() => {
    loadList()
  }, [loadList])

  const counts = useMemo(() => {
    if (statusCounts) {
      return {
        All: statusCounts.all ?? 0,
        Draft: statusCounts.draft ?? 0,
        Pending: statusCounts.pending ?? 0,
        Approved: statusCounts.approved ?? 0,
        Rejected: statusCounts.rejected ?? 0,
        Paid: statusCounts.paid ?? 0,
      }
    }
    return {
      All: invoices.length,
      Draft: 0,
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Paid: 0,
    }
  }, [statusCounts, invoices.length])

  const openDetail = useCallback(async (id) => {
    setDetailId(id)
    setDetailDoc(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, { credentials: 'include' })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Could not load invoice')
      setDetailDoc(json)
    } catch (e) {
      setDetailDoc({ _error: e.message ?? 'Error' })
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const refreshDetail = useCallback(async () => {
    if (detailId) await openDetail(detailId)
  }, [detailId, openDetail])

  function closeDetail() {
    setDetailId(null)
    setDetailDoc(null)
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">Invoices</h2>
          <p className="text-[13px] text-[#6B7280]">
            FIRS-style invoices with VAT, withholding tax & compliance fields
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors"
          >
            <HiOutlineArrowUpTray size={18} />
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <HiOutlinePlus size={18} />
            Add Invoice
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === f ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {f} <span className="text-[#9CA3AF] ml-1">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg">
            <HiOutlineMagnifyingGlass size={16} className="text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search invoice number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
            />
          </div>
        </div>
      </div>

      {listError ? (
        <div className="px-5 py-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[14px] text-[#B91C1C]">
          {listError}{' '}
          <button type="button" onClick={() => loadList()} className="underline ml-2">
            Retry
          </button>
        </div>
      ) : null}

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] flex flex-col overflow-hidden">
        {/* Desktop: scrollable body so long lists scroll inside max height */}
        <div className="hidden md:block invoice-table-scroll min-h-[280px] max-h-[min(520px,calc(100vh-16rem))] overflow-y-auto">
          <div className="overflow-x-auto invoice-table-scroll">
          <table className="w-full caption-bottom border-collapse">
            <thead className="sticky top-0 z-[1] bg-white shadow-[0_1px_0_0_#f3f4f6]">
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Buyer / vendor
                </th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Issue
                </th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Due
                </th>
                <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Net payable
                </th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {listLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 text-center align-middle text-[14px] text-[#9CA3AF] min-h-[420px] h-[420px]"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!listLoading &&
                invoices.map((inv) => {
                  const buyerName = inv.buyer?.businessName ?? '—'
                  const cfg = statusUi(inv.status)
                  const StatusIcon = cfg.icon
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
                            <HiOutlineDocumentText size={18} className="text-primary" />
                          </div>
                          <span className="text-[14px] font-semibold text-[#111827]">{inv.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-[#374151]">{buyerName}</td>
                      <td className="px-5 py-4 text-[13px] text-[#6B7280]">
                        {formatDisplayDate(inv.invoice_date)}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#6B7280]">
                        {formatDisplayDate(inv.due_date)}
                      </td>
                      <td className="px-5 py-4 text-right text-[14px] font-semibold text-[#111827]">
                        {formatNaira(inv.net_payable ?? inv.grand_total)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium ${cfg.cls}`}
                        >
                          <StatusIcon size={14} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(inv.id)}
                          className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-primary inline-flex"
                          title="View details"
                        >
                          <HiOutlineEye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              {!listLoading && invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 text-center align-middle text-[14px] text-[#9CA3AF] min-h-[420px] h-[420px]"
                  >
                    No invoices match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden invoice-table-scroll min-h-[240px] max-h-[min(480px,calc(100vh-14rem))] overflow-y-auto divide-y divide-[#F3F4F6]">
          {listLoading && (
            <div className="flex items-center justify-center min-h-[320px] px-5 text-[14px] text-[#9CA3AF]">
              Loading…
            </div>
          )}
          {!listLoading &&
            invoices.map((inv) => {
              const cfg = statusUi(inv.status)
              const StatusIcon = cfg.icon
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => openDetail(inv.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center shrink-0">
                    <HiOutlineDocumentText size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#111827] truncate">
                      {inv.buyer?.businessName ?? inv.invoice_number}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF]">
                      {inv.invoice_number} · Due {formatDisplayDate(inv.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {formatNaira(inv.net_payable ?? inv.grand_total)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${cfg.cls}`}
                    >
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                  </div>
                </button>
              )
            })}
          {!listLoading && invoices.length === 0 && (
            <div className="flex items-center justify-center min-h-[320px] px-5 text-[14px] text-[#9CA3AF]">
              No invoices match your filters
            </div>
          )}
        </div>

        {!listLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-[#F3F4F6] bg-[#FAFAFA]/80 shrink-0">
            {(() => {
              const total = pagination.total ?? 0
              const limit = pagination.limit ?? 20
              const tpRaw = pagination.totalPages ?? 0
              const tp = tpRaw > 0 ? tpRaw : 1
              const from = total === 0 ? 0 : (page - 1) * limit + 1
              const to = Math.min(page * limit, total)
              const canPrev =
                typeof pagination.hasPrevPage === 'boolean'
                  ? pagination.hasPrevPage
                  : page > 1 && total > 0 && tpRaw > 0
              const canNext =
                typeof pagination.hasNextPage === 'boolean'
                  ? pagination.hasNextPage
                  : total > 0 && tpRaw > 0 && page < tpRaw
              return (
                <>
                  <p className="text-[13px] text-[#6B7280] order-2 sm:order-1">
                    {total === 0 ? (
                      <>
                        Showing <span className="font-medium text-[#374151]">0</span> invoices
                      </>
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-medium text-[#374151]">
                          {from}–{to}
                        </span>{' '}
                        of <span className="font-medium text-[#374151]">{total}</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 order-1 sm:order-2">
                    <p className="text-[13px] text-[#6B7280] whitespace-nowrap">
                      Page <span className="font-medium text-[#374151]">{page}</span> of{' '}
                      <span className="font-medium text-[#374151]">{tp}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!canPrev || listLoading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 text-[13px] font-medium rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={!canNext || listLoading}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1.5 text-[13px] font-medium rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onCreated={async () => {
            await loadList()
          }}
        />
      )}
      {manualOpen && (
        <ManualInvoiceModal
          onClose={() => setManualOpen(false)}
          onCreated={async () => {
            setManualOpen(false)
            await loadList()
          }}
        />
      )}
      {detailId && (
        <InvoiceDetailDrawer
          loading={detailLoading}
          doc={detailDoc}
          onClose={closeDetail}
          refreshList={loadList}
          refreshDetail={refreshDetail}
        />
      )}
    </div>
  )
}

function statusUi(status) {
  const draft = {
    label: 'Draft',
    icon: HiOutlinePencilSquare,
    cls: 'text-[#4B5563] bg-[#F3F4F6]',
  }
  const map = {
    approved: {
      label: 'Approved',
      icon: HiOutlineCheckCircle,
      cls: 'text-[#059669] bg-[#ECFDF5]',
    },
    pending: {
      label: 'Pending',
      icon: HiOutlineClock,
      cls: 'text-[#D97706] bg-[#FFF7ED]',
    },
    rejected: {
      label: 'Rejected',
      icon: HiOutlineXCircle,
      cls: 'text-[#DC2626] bg-[#FEF2F2]',
    },
    paid: {
      label: 'Paid',
      icon: HiOutlineCurrencyDollar,
      cls: 'text-[#2563EB] bg-[#EFF6FF]',
    },
    draft,
  }
  return map[status] ?? draft
}

/* ── Upload ──────────────────────────────────────────────────────── */

function UploadModal({ onClose, onCreated }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [suggested, setSuggested] = useState(null)
  const [extractError, setExtractError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleFile(f) {
    setSuggested(null)
    setExtractError('')
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function handleExtract() {
    if (!file) return
    setExtracting(true)
    setExtractError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/invoices/extract', { method: 'POST', body: fd, credentials: 'include' })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Extract failed')
      setSuggested(json.suggestedCreateBody)
    } catch (e) {
      setExtractError(e.message ?? 'Extract failed')
    } finally {
      setExtracting(false)
    }
  }

  async function handleConfirmSave() {
    if (!suggested) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(suggested),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Could not save')
      await onCreated()
      onClose()
    } catch (e) {
      setExtractError(e.message ?? 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Upload Invoice PDF</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6]">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {extractError && (
            <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-lg">
              {extractError}
            </div>
          )}
          {!suggested ? (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-[#F3F0FF]'
                    : file
                      ? 'border-[#059669] bg-[#ECFDF5]'
                      : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineDocumentArrowUp size={32} className="text-[#059669]" />
                    <p className="text-[14px] font-medium text-[#111827]">{file.name}</p>
                    <p className="text-[12px] text-[#6B7280]">{(file.size / 1024).toFixed(1)} KB</p>
                    <button type="button" onClick={() => setFile(null)} className="text-[13px] text-[#DC2626] hover:underline mt-1">
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer pointer-events-none">
                    <HiOutlineArrowUpTray size={32} className="text-[#9CA3AF]" />
                    <p className="text-[14px] font-medium text-[#111827] pointer-events-none">Drop your PDF here</p>
                    <p className="text-[13px] text-[#9CA3AF] pointer-events-none">or browse</p>
                  </label>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={!file || extracting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 disabled:opacity-40"
              >
                {extracting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Extracting with AI…
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles size={18} />
                    Extract invoice data
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl">
                <HiOutlineCheckCircle size={20} className="text-[#059669]" />
                <p className="text-[13px] text-[#065F46] font-medium">Review extracted invoice data before saving</p>
              </div>
              <pre className="max-h-48 overflow-auto text-[11px] bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB] text-[#374151]">
                {JSON.stringify(suggested, null, 2)}
              </pre>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSuggested(null)} className="flex-1 py-3 border border-[#D1D5DB] text-[14px] font-medium rounded-xl">
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmSave}
                  className="flex-1 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 disabled:opacity-40"
                >
                  {submitting ? 'Saving…' : 'Confirm & save'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const emptyBuyer = () => ({
  type: 'business',
  businessName: '',
  contactPerson: '',
  tin: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
  },
  contact: { email: '', phone: '' },
})

const emptyItem = () => ({
  description: '',
  quantity: 1,
  unit: 'unit',
  unitPrice: 0,
  vatApplicable: true,
  vatRate: 7.5,
})

/* ── Create invoice modal ───────────────────────────────────────── */

function ManualInvoiceModal({ onClose, onCreated }) {
  const today = new Date().toISOString().slice(0, 10)

  const [invoiceDate, setInvoiceDate] = useState(today)
  const [dueDate, setDueDate] = useState('')
  const [purchaseOrderNumber, setPo] = useState('')
  const [buyer, setBuyer] = useState(emptyBuyer)
  const [items, setItems] = useState([emptyItem(), emptyItem()])
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 7 days')
  const [discount, setDiscount] = useState(0)
  const [withholdingTaxRate, setWht] = useState(0)
  const [requiresSignature, setRequiresSignature] = useState(false)
  const [signedBy, setSignedBy] = useState('')
  const [initialStatus, setInitialStatus] = useState('pending')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const preview = useMemo(() => computePreview(items, discount, withholdingTaxRate), [
    items,
    discount,
    withholdingTaxRate,
  ])

  useEffect(() => {
    if (!dueDate && invoiceDate) {
      const d = new Date(`${invoiceDate}T12:00:00`)
      d.setDate(d.getDate() + 7)
      setDueDate(d.toISOString().slice(0, 10))
    }
  }, [invoiceDate, dueDate])

  function updBuyer(path, val) {
    setBuyer((b) => {
      if (path.startsWith('addr.')) {
        const key = path.replace('addr.', '')
        return { ...b, address: { ...b.address, [key]: val } }
      }
      if (path.startsWith('contact.')) {
        const key = path.replace('contact.', '')
        return { ...b, contact: { ...b.contact, [key]: val } }
      }
      return { ...b, [path]: val }
    })
  }

  function updItem(i, field, raw) {
    setItems((rows) =>
      rows.map((row, idx) =>
        idx === i
          ? {
              ...row,
              [field]:
                field === 'quantity' || field === 'unitPrice' || field === 'vatRate'
                  ? Number(raw) || 0
                  : field === 'vatApplicable'
                    ? Boolean(raw)
                    : raw,
            }
          : row,
      ),
    )
  }

  async function submit(e) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    const cleanItems = items
      .filter((it) => it.description.trim())
      .map((it) => ({
        description: it.description.trim(),
        quantity: Number(it.quantity),
        unit: it.unit || 'unit',
        unitPrice: Number(it.unitPrice),
        vatApplicable: Boolean(it.vatApplicable),
        vatRate: Number(it.vatRate ?? 7.5),
      }))

    if (!buyer.businessName.trim()) {
      setSaveError('Buyer name is required')
      setSaving(false)
      return
    }
    if (cleanItems.length < 1) {
      setSaveError('Add at least one line item with a description')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceDate,
          dueDate,
          currency: 'NGN',
          purchaseOrderNumber,
          buyer: {
            ...buyer,
            businessName: buyer.businessName.trim(),
          },
          items: cleanItems,
          paymentTerms,
          acceptedMethods: ['bank_transfer'],
          requiresSignature,
          signedBy: signedBy.trim(),
          discount,
          withholdingTaxRate: withholdingTaxRate,
          initialStatus,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.error?.message ?? 'Could not create invoice')
      }

      await onCreated()
      onClose()
    } catch (err) {
      setSaveError(err.message ?? 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div role="presentation" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div
        role="dialog"
        className="max-w-[720px] mx-auto my-6 bg-white rounded-2xl shadow-xl overflow-hidden mb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-[17px] font-semibold text-[#111827]">New invoice</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 flex rounded-lg hover:bg-[#F3F4F6] items-center justify-center">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {saveError && (
            <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-lg">{saveError}</div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Invoice date *" type="date" value={invoiceDate} onChange={setInvoiceDate} required />
            <Field label="Due date *" type="date" value={dueDate} onChange={setDueDate} required />
          </div>
          <Field label="Purchase order #" value={purchaseOrderNumber} onChange={setPo} placeholder="Optional" />

          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Buyer</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business name *" value={buyer.businessName} onChange={(v) => updBuyer('businessName', v)} required />
              <Field label="Contact person" value={buyer.contactPerson} onChange={(v) => updBuyer('contactPerson', v)} />
              <Field label="Buyer TIN" value={buyer.tin} onChange={(v) => updBuyer('tin', v)} placeholder="09876543-0001" />
              <Field label="Email" type="email" value={buyer.contact?.email ?? ''} onChange={(v) => updBuyer('contact.email', v)} />
              <Field label="Phone" value={buyer.contact?.phone ?? ''} onChange={(v) => updBuyer('contact.phone', v)} />
              <Field label="Street" value={buyer.address?.street ?? ''} onChange={(v) => updBuyer('addr.street', v)} />
              <Field label="City" value={buyer.address?.city ?? ''} onChange={(v) => updBuyer('addr.city', v)} />
              <Field label="State" value={buyer.address?.state ?? ''} onChange={(v) => updBuyer('addr.state', v)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Line items</h4>
              <button
                type="button"
                onClick={() => setItems((r) => [...r, emptyItem()])}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                + Add row
              </button>
            </div>
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  <tr>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 w-[70px]">Qty</th>
                    <th className="px-3 py-2 w-[72px]">Unit</th>
                    <th className="px-3 py-2 w-[96px]">Price</th>
                    <th className="px-3 py-2 w-[56px]">VAT%</th>
                    <th className="px-3 py-2 w-[72px]" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr key={i} className="border-t border-[#F3F4F6] align-top">
                      <td className="px-2 py-2">
                        <textarea
                          className="w-full px-2 py-1 text-[13px] border border-[#D1D5DB] rounded-lg min-h-[40px]"
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) => updItem(i, 'description', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0.01}
                          step="any"
                          className="w-full px-2 py-1 text-[13px] border border-[#D1D5DB] rounded-lg"
                          value={row.quantity}
                          onChange={(e) => updItem(i, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-[13px] border border-[#D1D5DB] rounded-lg"
                          value={row.unit}
                          onChange={(e) => updItem(i, 'unit', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className="w-full px-2 py-1 text-[13px] border border-[#D1D5DB] rounded-lg"
                          value={row.unitPrice}
                          onChange={(e) => updItem(i, 'unitPrice', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          disabled={row.vatApplicable === false}
                          className="w-full px-2 py-1 text-[13px] border border-[#D1D5DB] rounded-lg disabled:bg-[#F3F4F6]"
                          value={row.vatRate}
                          onChange={(e) => updItem(i, 'vatRate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-1">
                          <label className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                            <input
                              type="checkbox"
                              checked={row.vatApplicable !== false}
                              onChange={(e) => updItem(i, 'vatApplicable', e.target.checked)}
                            />
                            VAT
                          </label>
                          {items.length > 1 ? (
                            <button
                              type="button"
                              className="text-[11px] text-[#DC2626]"
                              onClick={() => setItems((rows) => rows.filter((_, j) => j !== i))}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Discount (₦)" type="number" min={0} value={discount} onChange={(v) => setDiscount(Number(v) || 0)} />
            <Field
              label="Withholding tax % (on subtotal)"
              type="number"
              min={0}
              step="any"
              value={withholdingTaxRate}
              onChange={(v) => setWht(Number(v) || 0)}
            />
          </div>

          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 text-[13px] space-y-1">
            <div className="flex justify-between text-[#6B7280]">
              <span>Subtotal</span>
              <span>{formatNaira(preview.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span>VAT amount</span>
              <span>{formatNaira(preview.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span>Grand total</span>
              <span>{formatNaira(preview.grandTotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#111827] pt-2 border-t border-[#E5E7EB]">
              <span>Net payable (after WHT)</span>
              <span>{formatNaira(preview.netPayable)}</span>
            </div>
          </div>

          <Field label="Payment terms" value={paymentTerms} onChange={setPaymentTerms} />

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[14px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={requiresSignature} onChange={(e) => setRequiresSignature(e.target.checked)} />
              Requires signature
            </label>
            <Field label="Signed by" value={signedBy} onChange={setSignedBy} placeholder="Name" compact />
          </div>

          <div className="flex gap-4 items-center">
            <label className="text-[13px] font-medium text-[#374151]">Submit as:</label>
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#D1D5DB] text-[14px]"
            >
              <option value="pending">Pending review</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#D1D5DB] rounded-xl font-medium text-[14px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required, compact, min, step }) {
  return (
    <div className={compact ? 'inline-flex flex-col min-w-[120px]' : ''}>
      <label className="block text-[14px] font-medium text-[#111827] mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-[14px]`}
      />
    </div>
  )
}

/* ── Detail drawer ─────────────────────────────────────────────── */

function InvoiceDetailDrawer({ doc, loading, onClose, refreshList, refreshDetail }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Payment (Squad) state
  const [payOpen, setPayOpen] = useState(false)
  const [payBankCode, setPayBankCode] = useState('')
  const [payAccountNumber, setPayAccountNumber] = useState('')
  const [payAccountName, setPayAccountName] = useState('')
  const [payLookingUp, setPayLookingUp] = useState(false)
  const [payLookupName, setPayLookupName] = useState('')
  const [payLookupError, setPayLookupError] = useState('')
  const [paySending, setPaySending] = useState(false)
  const [payResult, setPayResult] = useState(null)
  const [payError, setPayError] = useState('')

  async function patchStatus(next) {
    if (!doc?.metadata?.id) return
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(`/api/invoices/${doc.metadata.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error?.message ?? 'Update failed')
      await refreshList()
      await refreshDetail()
    } catch (e) {
      setErr(e.message ?? 'Error')
    } finally {
      setBusy(false)
    }
  }

  async function removeInvoice() {
    if (!doc?.metadata?.id) return
    if (!window.confirm('Delete this invoice permanently?')) return
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(`/api/invoices/${doc.metadata.id}`, { method: 'DELETE', credentials: 'include' })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error?.message ?? 'Delete failed')
      onClose()
      await refreshList()
    } catch (e) {
      setErr(e.message ?? 'Error')
    } finally {
      setBusy(false)
    }
  }

  // ── Squad Payment ─────────────────────────────────────────────
  async function handleAccountLookup() {
    if (!payBankCode || !payAccountNumber) {
      setPayLookupError('Select a bank and enter an account number')
      return
    }
    setPayLookingUp(true)
    setPayLookupError('')
    setPayLookupName('')
    try {
      const res = await fetch('/api/payout/account-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bankCode: payBankCode, accountNumber: payAccountNumber }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error?.message ?? 'Lookup failed')
      setPayLookupName(j.accountName)
      setPayAccountName(j.accountName)
    } catch (e) {
      setPayLookupError(e.message ?? 'Lookup failed')
    } finally {
      setPayLookingUp(false)
    }
  }

  async function handlePay() {
    if (!doc?.metadata?.id) return
    if (!payBankCode || !payAccountNumber || !payAccountName) {
      setPayError('Please complete all bank details and verify the account name')
      return
    }
    const netPayable = doc.totals?.netPayable ?? 0
    if (netPayable <= 0) {
      setPayError('Invoice net payable must be greater than zero')
      return
    }

    const confirmed = window.confirm(
      `Send ₦${Number(netPayable).toLocaleString()} to ${payAccountName} (${payAccountNumber})? This action cannot be undone.`,
    )
    if (!confirmed) return

    setPaySending(true)
    setPayError('')
    setPayResult(null)
    try {
      const res = await fetch(`/api/invoices/${doc.metadata.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bankCode: payBankCode,
          accountNumber: payAccountNumber,
          accountName: payAccountName,
        }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error?.message ?? j?.warning ?? 'Payment failed')
      setPayResult(j)
      await refreshList()
      await refreshDetail()
    } catch (e) {
      setPayError(e.message ?? 'Payment failed')
    } finally {
      setPaySending(false)
    }
  }

  function openPayModal() {
    setPayError('')
    setPayResult(null)
    setPayLookupName('')
    setPayLookupError('')
    setPayBankCode('')
    setPayAccountNumber('')
    setPayAccountName('')
    setPayOpen(true)
  }

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-[16px] font-semibold text-[#111827]">Invoice detail</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6]">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="space-y-6">
              {/* Top row: status + amount */}
              <div className="flex items-center justify-between gap-4">
                <Skeleton width={90} height={32} borderRadius={8} />
                <Skeleton width={140} height={32} borderRadius={6} />
              </div>

              {/* Invoice details */}
              <div>
                <Skeleton width={60} height={12} style={{ marginBottom: 10 }} />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton width={40} height={10} style={{ marginBottom: 4 }} />
                      <Skeleton width={i % 2 === 0 ? 100 : 80} height={16} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller block */}
              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-2 bg-black/[0.02]">
                  <Skeleton width={50} height={11} />
                </div>
                <div className="px-4 py-3 space-y-2">
                  <Skeleton width={180} height={16} />
                  <Skeleton width={120} height={13} />
                  <Skeleton width={200} height={13} />
                  <Skeleton width={140} height={13} />
                  <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                    <Skeleton width={40} height={13} style={{ marginBottom: 4 }} />
                    <Skeleton width={160} height={13} style={{ marginBottom: 2 }} />
                    <Skeleton width={100} height={13} />
                  </div>
                </div>
              </div>

              {/* Buyer block */}
              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-2 bg-black/[0.02]">
                  <Skeleton width={50} height={11} />
                </div>
                <div className="px-4 py-3 space-y-2">
                  <Skeleton width={200} height={16} />
                  <Skeleton width={140} height={13} />
                  <Skeleton width={160} height={13} />
                </div>
              </div>

              {/* Items table */}
              <div>
                <Skeleton width={50} height={12} style={{ marginBottom: 10 }} />
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className="bg-[#F9FAFB] px-4 py-2 flex gap-4">
                    <Skeleton width="30%" height={11} />
                    <Skeleton width="10%" height={11} />
                    <Skeleton width="15%" height={11} />
                    <Skeleton width="10%" height={11} />
                    <Skeleton width="15%" height={11} />
                  </div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-4 py-2.5 border-t border-[#F3F4F6] flex gap-4">
                      <Skeleton width={`${30 + (i * 5)}%`} height={13} />
                      <Skeleton width="10%" height={13} />
                      <Skeleton width="15%" height={13} />
                      <Skeleton width="10%" height={13} />
                      <Skeleton width="15%" height={13} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div>
                <Skeleton width={60} height={12} style={{ marginBottom: 10 }} />
                <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton width={60 + i * 10} height={13} />
                      <Skeleton width={60} height={13} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <Skeleton width={70} height={12} style={{ marginBottom: 10 }} />
                <Skeleton width="60%" height={13} style={{ marginBottom: 4 }} />
                <Skeleton width="40%" height={11} />
              </div>

              {/* Compliance */}
              <div>
                <Skeleton width={90} height={12} style={{ marginBottom: 10 }} />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5 ml-5">
                    <Skeleton width={5} height={5} circle />
                    <Skeleton width={120 + i * 20} height={13} />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                <Skeleton width={110} height={44} borderRadius={12} />
                <Skeleton width={100} height={44} borderRadius={12} />
              </div>
            </div>
          )}
          {doc?._error && <p className="text-[14px] text-[#DC2626]">{doc._error}</p>}
          {err && <p className="text-[14px] text-[#DC2626]">{err}</p>}

          {!loading && doc && !doc._error && (
            <>
              {(() => {
                const cfg = statusUi(doc.invoice?.status ?? '')
                const StatusIcon = cfg.icon
                return (
                  <div className="flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium ${cfg.cls}`}>
                      <StatusIcon size={16} />
                      {cfg.label}
                    </span>
                    <p className="text-[22px] font-bold text-[#111827]">{formatNaira(doc.totals?.netPayable ?? 0)}</p>
                  </div>
                )
              })()}

              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">Invoice</h4>
                <div className="grid grid-cols-2 gap-3 text-[14px]">
                  <Detail label="Number" val={doc.invoice?.invoiceNumber} />
                  <Detail label="Status" val={doc.invoice?.status} />
                  <Detail label="Issue" val={formatDisplayDate(doc.invoice?.invoiceDate)} />
                  <Detail label="Due" val={formatDisplayDate(doc.invoice?.dueDate)} />
                  <Detail label="Currency" val={doc.invoice?.currency} />
                  <Detail label="PO" val={doc.invoice?.purchaseOrderNumber ?? '—'} />
                </div>
              </div>

              <SellerBuyerBlock title="Seller" data={doc.seller} accent="bg-[#F3F0FF]" />
              <SellerBuyerBlock title="Buyer" data={doc.buyer} />

              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">Items</h4>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-[#F9FAFB] text-[11px] text-[#9CA3AF] uppercase">
                      <tr>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">VAT</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(doc.items ?? []).map((it, idx) => (
                        <tr key={it.id ?? idx} className="border-t border-[#F3F4F6] text-[13px]">
                          <td className="px-4 py-2">{it.description}</td>
                          <td className="px-4 py-2 text-center">{it.quantity}</td>
                          <td className="px-4 py-2 text-right">{formatNaira(it.unitPrice)}</td>
                          <td className="px-4 py-2 text-right">{it.vatApplicable ? `${it.vatRate}%` : '—'}</td>
                          <td className="px-4 py-2 text-right font-medium">{formatNaira(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">Totals</h4>
                <div className="rounded-xl border border-[#E5E7EB] p-4 text-[13px] space-y-2">
                  <TotRow label="Subtotal" n={doc.totals?.subtotal} />
                  <TotRow label="Discount" n={doc.totals?.discount} />
                  <TotRow label="VAT" n={doc.totals?.vatAmount} />
                  <TotRow
                    label="WHT"
                    sub={`(${doc.totals?.withholdingTax?.rate ?? 0}% on subtotal)`}
                    n={doc.totals?.withholdingTax?.amount}
                  />
                  <TotRow label="Grand total" strong n={doc.totals?.grandTotal} />
                  <TotRow label="Net payable" strong n={doc.totals?.netPayable} emphasis />
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">Payment</h4>
                <p className="text-[13px] text-[#374151]">{doc.payment?.paymentTerms}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">
                  Methods: {(doc.payment?.acceptedMethods ?? []).join(', ') || '—'}
                </p>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                  Compliance
                </h4>
                <ul className="text-[13px] text-[#374151] space-y-1 list-disc ml-5">
                  <li>FIRS aligned: {doc.compliance?.firsCompliant ? 'Yes' : 'No'}</li>
                  <li>Requires signature: {doc.compliance?.requiresSignature ? 'Yes' : 'No'}</li>
                  <li>Signed by: {doc.compliance?.signedBy || '—'}</li>
                  <li>Signature date: {formatDisplayDate(doc.compliance?.signatureDate)}</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E5E7EB]">
                {doc.invoice?.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patchStatus('approved')}
                      className="flex items-center gap-2 px-4 py-3 bg-[#059669] text-white text-[13px] font-semibold rounded-xl disabled:opacity-40"
                    >
                      <HiOutlineCheckCircle size={18} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patchStatus('rejected')}
                      className="flex items-center gap-2 px-4 py-3 bg-[#DC2626] text-white text-[13px] font-semibold rounded-xl disabled:opacity-40"
                    >
                      <HiOutlineXCircle size={18} /> Reject
                    </button>
                  </>
                )}
                {doc.invoice?.status === 'approved' && (
                  <button
                    type="button"
                    disabled={busy || paySending}
                    onClick={openPayModal}
                    className="flex items-center gap-2 px-4 py-3 bg-[#059669] text-white text-[13px] font-semibold rounded-xl disabled:opacity-40"
                  >
                    <HiOutlineBanknotes size={18} /> Pay via Squad
                  </button>
                )}
                {(doc.invoice?.status === 'draft' || doc.invoice?.status === 'rejected') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={removeInvoice}
                    className="flex items-center gap-2 px-4 py-3 border border-[#FECACA] text-[#DC2626] text-[13px] font-semibold rounded-xl disabled:opacity-40"
                  >
                    <HiOutlineTrash size={18} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Squad Payment Modal ─────────────────────────────── */}
        {payOpen && (
          <div
            role="presentation"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setPayOpen(false)}
          >
            <div
              role="dialog"
              className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                <h3 className="text-[15px] font-semibold text-[#111827] flex items-center gap-2">
                  <HiOutlineBanknotes size={20} className="text-[#059669]" />
                  Pay via Squad
                </h3>
                <button
                  type="button"
                  onClick={() => setPayOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
                  disabled={paySending}
                >
                  <HiOutlineXMark size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                {/* Invoice summary */}
                <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 text-[13px] space-y-1">
                  <p className="text-[#6B7280]">
                    Invoice <span className="font-medium text-[#111827]">{doc.invoice?.invoiceNumber}</span>
                  </p>
                  <p>
                    Paying:{' '}
                    <span className="font-bold text-[16px] text-[#111827]">
                      {formatNaira(doc.totals?.netPayable ?? 0)}
                    </span>
                  </p>
                  <p className="text-[#6B7280]">
                    To: <span className="font-medium text-[#111827]">{doc.buyer?.businessName || 'Vendor'}</span>
                  </p>
                </div>

                {/* Success state */}
                {payResult ? (
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-4 text-[13px] space-y-2">
                    <p className="font-semibold text-[#059669] flex items-center gap-2">
                      <HiOutlineCheckCircle size={18} /> Payment sent
                    </p>
                    <p className="text-[#374151]">
                      {formatNaira(payResult.transfer?.amountNaira ?? 0)} transferred to{' '}
                      {payResult.transfer?.accountName ?? 'vendor'}.
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Ref: {payResult.transfer?.transactionRef ?? '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPayOpen(false)
                        setPayResult(null)
                      }}
                      className="mt-2 px-4 py-2 bg-[#059669] text-white text-[13px] font-semibold rounded-lg w-full"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Bank selection */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                        Bank
                      </label>
                      <select
                        value={payBankCode}
                        onChange={(e) => {
                          setPayBankCode(e.target.value)
                          setPayLookupName('')
                          setPayLookupError('')
                        }}
                        className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select bank</option>
                        {BANK_CODES.map(([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                        <option value="other">Other (enter code below)</option>
                      </select>
                      {payBankCode === 'other' && (
                        <input
                          type="text"
                          placeholder="Enter bank code (e.g. 000013)"
                          value=""
                          onChange={(e) => {
                            setPayBankCode(e.target.value)
                            setPayLookupName('')
                            setPayLookupError('')
                          }}
                          className="mt-2 w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      )}
                    </div>

                    {/* Account number */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                        Account number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="10-digit NUBAN"
                          value={payAccountNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setPayAccountNumber(v)
                            setPayLookupName('')
                            setPayLookupError('')
                          }}
                          className="flex-1 px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button
                          type="button"
                          disabled={payLookingUp || !payBankCode || payAccountNumber.length !== 10}
                          onClick={handleAccountLookup}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-[#F3F4F6] text-[13px] font-medium rounded-lg hover:bg-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {payLookingUp ? (
                            <HiOutlineArrowPath size={16} className="animate-spin" />
                          ) : (
                            <HiOutlineMagnifyingGlass size={16} />
                          )}
                          Verify
                        </button>
                      </div>
                      {payLookupError && (
                        <p className="text-[12px] text-[#DC2626] mt-1">{payLookupError}</p>
                      )}
                    </div>

                    {/* Verified account name */}
                    {payLookupName && (
                      <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg px-3 py-2.5">
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">Account name</p>
                        <p className="text-[14px] font-semibold text-[#059669]">{payLookupName}</p>
                      </div>
                    )}

                    {/* Account name (editable) */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                        Account name
                      </label>
                      <input
                        type="text"
                        placeholder="Auto-filled after verification"
                        value={payAccountName}
                        onChange={(e) => setPayAccountName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-[#F9FAFB]"
                      />
                    </div>

                    {payError && (
                      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2.5 text-[12px] text-[#DC2626]">
                        {payError}
                      </div>
                    )}

                    {/* Pay button */}
                    <button
                      type="button"
                      disabled={paySending || !payBankCode || payAccountNumber.length !== 10 || !payAccountName}
                      onClick={handlePay}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white text-[14px] font-semibold rounded-xl disabled:opacity-40 hover:bg-[#047857] transition-colors"
                    >
                      {paySending ? (
                        <>
                          <HiOutlineArrowPath size={18} className="animate-spin" />
                          Processing payment...
                        </>
                      ) : (
                        <>
                          <HiOutlineBanknotes size={18} />
                          Pay {formatNaira(doc.totals?.netPayable ?? 0)}
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-[#9CA3AF] text-center">
                      Funds are transferred from your Squad wallet via NIP.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </aside>
    </div>
  )
}

function Detail({ label, val }) {
  return (
    <div>
      <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="font-medium">{val ?? '—'}</p>
    </div>
  )
}

function TotRow({ label, n, strong, emphasis, sub }) {
  const v =
    typeof n === 'number' && !Number.isNaN(n)
      ? formatNaira(n)
      : n != null && n !== ''
        ? String(n)
        : formatNaira(0)
  return (
    <div className={`flex justify-between gap-4 ${emphasis ? 'pt-3 border-t border-[#F3F4F6]' : ''}`}>
      <span className={`text-[#6B7280] ${strong ? 'font-semibold text-[#111827]' : ''}`}>
        {label}
        {sub ? <span className="text-[11px] font-normal ml-2">{sub}</span> : null}
      </span>
      <span className={`${strong ? 'font-semibold' : ''} ${emphasis ? 'font-bold text-[#111827]' : ''}`}>{v}</span>
    </div>
  )
}

function SellerBuyerBlock({ title, data, accent }) {
  if (!data) return null
  const bg = accent ?? ''
  return (
    <div className={`rounded-xl border border-[#E5E7EB] overflow-hidden ${bg}`}>
      <div className="px-4 py-2 border-b border-[#E5E7EB]/80 bg-black/[0.02]">
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">{title}</h4>
      </div>
      <div className="px-4 py-3 text-[13px] space-y-1 text-[#374151]">
        <p className="font-semibold text-[#111827]">{data.businessName}</p>
        {data.contactPerson ? <p>Contact: {data.contactPerson}</p> : null}
        {(data.registrationType || data.cacNumber) && (
          <p className="text-[12px] text-[#6B7280]">
            {[data.registrationType, data.cacNumber ? `CAC ${data.cacNumber}` : null].filter(Boolean).join(' · ')}
          </p>
        )}
        {(data.tin || data.vatNumber) && (
          <p className="text-[12px] text-[#6B7280]">
            {[data.tin ? `TIN ${data.tin}` : null, data.vatNumber ? `VAT ${data.vatNumber}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {data.address?.street ||
        data.address?.city ||
        data.address?.state ||
        data.address?.country ||
        data.address?.postalCode ? (
          <p>
            {[data.address?.street, [data.address?.city, data.address?.state].filter(Boolean).join(', ')]
              .filter(Boolean)
              .join(' · ')}
            {data.address?.postalCode ? ` · ${data.address.postalCode}` : ''}
            {data.address?.country ? ` · ${data.address.country}` : ''}
          </p>
        ) : null}
        {data.contact?.email ? <p>Email: {data.contact.email}</p> : null}
        {data.contact?.phone ? <p>Tel: {data.contact.phone}</p> : null}
        {data.contact?.website ? <p>{data.contact.website}</p> : null}
        {data.bankDetails?.bankName || data.bankDetails?.accountNumber ? (
          <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-[12px]">
            <p className="font-medium text-[#111827]">Bank</p>
            <p>{[data.bankDetails.bankName, data.bankDetails.accountName].filter(Boolean).join(' · ')}</p>
            <p>Acct: {data.bankDetails.accountNumber ?? '—'}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
