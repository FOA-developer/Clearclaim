'use client'

import { useState, useCallback } from 'react'
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
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

const DUMMY_INVOICES = [
  {
    id: 'INV-2401',
    vendor: 'Apex Supplies Ltd',
    amount: '₦2,450,000',
    issueDate: 'May 1, 2026',
    dueDate: 'May 31, 2026',
    status: 'approved',
    items: [
      { description: 'Office furniture — desks x12', qty: 12, unitPrice: '₦150,000', total: '₦1,800,000' },
      { description: 'Ergonomic chairs x12', qty: 12, unitPrice: '₦45,000', total: '₦540,000' },
      { description: 'Delivery & installation', qty: 1, unitPrice: '₦110,000', total: '₦110,000' },
    ],
  },
  {
    id: 'INV-2402',
    vendor: 'NovaTech Systems',
    amount: '₦890,000',
    issueDate: 'May 5, 2026',
    dueDate: 'Jun 4, 2026',
    status: 'pending',
    items: [
      { description: 'Cloud hosting — May 2026', qty: 1, unitPrice: '₦350,000', total: '₦350,000' },
      { description: 'SSL certificates (annual)', qty: 5, unitPrice: '₦28,000', total: '₦140,000' },
      { description: 'DevOps consulting — 20hrs', qty: 20, unitPrice: '₦20,000', total: '₦400,000' },
    ],
  },
  {
    id: 'INV-2403',
    vendor: 'Meridian Logistics',
    amount: '₦4,100,000',
    issueDate: 'Apr 28, 2026',
    dueDate: 'May 28, 2026',
    status: 'approved',
    items: [
      { description: 'Freight — Lagos to Abuja', qty: 3, unitPrice: '₦800,000', total: '₦2,400,000' },
      { description: 'Warehousing — April', qty: 1, unitPrice: '₦1,200,000', total: '₦1,200,000' },
      { description: 'Insurance surcharge', qty: 1, unitPrice: '₦500,000', total: '₦500,000' },
    ],
  },
  {
    id: 'INV-2404',
    vendor: 'Greenfield Agritech',
    amount: '₦1,820,500',
    issueDate: 'May 8, 2026',
    dueDate: 'Jun 7, 2026',
    status: 'pending',
    items: [
      { description: 'Fertilizer supply — 50 bags', qty: 50, unitPrice: '₦25,000', total: '₦1,250,000' },
      { description: 'Seed packets — hybrid maize', qty: 100, unitPrice: '₦5,705', total: '₦570,500' },
    ],
  },
  {
    id: 'INV-2405',
    vendor: 'Horizon Energy',
    amount: '₦3,200,000',
    issueDate: 'May 2, 2026',
    dueDate: 'Jun 1, 2026',
    status: 'rejected',
    items: [
      { description: 'Diesel supply — 5000L', qty: 5000, unitPrice: '₦400', total: '₦2,000,000' },
      { description: 'Generator maintenance', qty: 1, unitPrice: '₦700,000', total: '₦700,000' },
      { description: 'Emergency call-out', qty: 2, unitPrice: '₦250,000', total: '₦500,000' },
    ],
  },
  {
    id: 'INV-2406',
    vendor: 'Zenith Cleaning Co.',
    amount: '₦480,000',
    issueDate: 'May 10, 2026',
    dueDate: 'May 25, 2026',
    status: 'approved',
    items: [
      { description: 'Office cleaning — May', qty: 1, unitPrice: '₦320,000', total: '₦320,000' },
      { description: 'Deep carpet clean', qty: 1, unitPrice: '₦160,000', total: '₦160,000' },
    ],
  },
]

const statusConfig = {
  approved: { label: 'Approved', icon: HiOutlineCheckCircle, cls: 'text-[#059669] bg-[#ECFDF5]' },
  pending: { label: 'Pending', icon: HiOutlineClock, cls: 'text-[#D97706] bg-[#FFF7ED]' },
  rejected: { label: 'Rejected', icon: HiOutlineXCircle, cls: 'text-[#DC2626] bg-[#FEF2F2]' },
}

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

export default function InvoicesView() {
  const [invoices, setInvoices] = useState(DUMMY_INVOICES)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [detailInvoice, setDetailInvoice] = useState(null)

  const filtered = invoices.filter((inv) => {
    const matchFilter = filter === 'All' || inv.status === filter.toLowerCase()
    const matchSearch = !search || inv.vendor.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    All: invoices.length,
    Pending: invoices.filter((i) => i.status === 'pending').length,
    Approved: invoices.filter((i) => i.status === 'approved').length,
    Rejected: invoices.filter((i) => i.status === 'rejected').length,
  }

  function handleNewInvoice(inv) {
    setInvoices((prev) => [inv, ...prev])
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">Invoices</h2>
          <p className="text-[13px] text-[#6B7280]">Manage vendor invoices, upload PDFs for OCR extraction</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors"
          >
            <HiOutlineArrowUpTray size={18} />
            Upload PDF
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <HiOutlinePlus size={18} />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
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
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Invoice</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Vendor</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Issue Date</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Due Date</th>
                <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Amount</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Status</th>
                <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const cfg = statusConfig[inv.status]
                const StatusIcon = cfg.icon
                return (
                  <tr key={inv.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
                          <HiOutlineDocumentText size={18} className="text-primary" />
                        </div>
                        <span className="text-[14px] font-semibold text-[#111827]">{inv.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-[#374151]">{inv.vendor}</td>
                    <td className="px-5 py-4 text-[13px] text-[#6B7280]">{inv.issueDate}</td>
                    <td className="px-5 py-4 text-[13px] text-[#6B7280]">{inv.dueDate}</td>
                    <td className="px-5 py-4 text-right text-[14px] font-semibold text-[#111827]">{inv.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium ${cfg.cls}`}>
                        <StatusIcon size={14} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDetailInvoice(inv)}
                        className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-primary"
                        title="View details"
                      >
                        <HiOutlineEye size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[14px] text-[#9CA3AF]">
                    No invoices match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-[#F3F4F6]">
          {filtered.map((inv) => {
            const cfg = statusConfig[inv.status]
            const StatusIcon = cfg.icon
            return (
              <button key={inv.id} onClick={() => setDetailInvoice(inv)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center shrink-0">
                  <HiOutlineDocumentText size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#111827] truncate">{inv.vendor}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{inv.id} &middot; Due {inv.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-[#111827]">{inv.amount}</p>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${cfg.cls}`}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-[14px] text-[#9CA3AF]">No invoices match your filters</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onAdd={handleNewInvoice} />}
      {manualOpen && <ManualInvoiceModal onClose={() => setManualOpen(false)} onAdd={handleNewInvoice} />}
      {detailInvoice && <InvoiceDetail invoice={detailInvoice} onClose={() => setDetailInvoice(null)} />}
    </div>
  )
}

/* ── Upload PDF Modal with dummy OCR ─────────────────────────────── */

function UploadModal({ onClose, onAdd }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(null)

  function handleFile(f) {
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function handleExtract() {
    setExtracting(true)
    setTimeout(() => {
      setExtracted({
        id: `INV-${2500 + Math.floor(Math.random() * 100)}`,
        vendor: 'Extracted Vendor Ltd',
        amount: '₦1,750,000',
        issueDate: 'May 14, 2026',
        dueDate: 'Jun 13, 2026',
        status: 'pending',
        items: [
          { description: 'Professional services — Q2', qty: 1, unitPrice: '₦1,200,000', total: '₦1,200,000' },
          { description: 'Material costs', qty: 1, unitPrice: '₦400,000', total: '₦400,000' },
          { description: 'Admin fee', qty: 1, unitPrice: '₦150,000', total: '₦150,000' },
        ],
      })
      setExtracting(false)
    }, 2500)
  }

  function handleConfirm() {
    if (extracted) {
      onAdd(extracted)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Upload Invoice PDF</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!extracted ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-[#F3F0FF]' : file ? 'border-[#059669] bg-[#ECFDF5]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineDocumentArrowUp size={32} className="text-[#059669]" />
                    <p className="text-[14px] font-medium text-[#111827]">{file.name}</p>
                    <p className="text-[12px] text-[#6B7280]">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={() => setFile(null)} className="text-[13px] text-[#DC2626] hover:underline mt-1">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineArrowUpTray size={32} className="text-[#9CA3AF]" />
                    <p className="text-[14px] font-medium text-[#111827]">Drop your PDF here</p>
                    <p className="text-[13px] text-[#9CA3AF]">or click to browse</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      style={{ position: 'absolute' }}
                    />
                  </div>
                )}
              </div>

              {/* Extract button */}
              <button
                onClick={handleExtract}
                disabled={!file || extracting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {extracting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Extracting data with OCR...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles size={18} />
                    Extract Invoice Data
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Extracted preview */}
              <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl">
                <HiOutlineCheckCircle size={20} className="text-[#059669]" />
                <p className="text-[13px] text-[#065F46] font-medium">Data extracted successfully from PDF</p>
              </div>

              <div className="space-y-3">
                <ExtractedField label="Invoice ID" value={extracted.id} />
                <ExtractedField label="Vendor" value={extracted.vendor} />
                <ExtractedField label="Amount" value={extracted.amount} />
                <ExtractedField label="Issue Date" value={extracted.issueDate} />
                <ExtractedField label="Due Date" value={extracted.dueDate} />
              </div>

              <div>
                <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-2">Line Items</p>
                <div className="space-y-2">
                  {extracted.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                      <div>
                        <p className="text-[13px] font-medium text-[#111827]">{item.description}</p>
                        <p className="text-[12px] text-[#9CA3AF]">Qty: {item.qty} &times; {item.unitPrice}</p>
                      </div>
                      <p className="text-[13px] font-semibold text-[#111827]">{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirm} className="flex-1 py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all">
                  Confirm & Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ExtractedField({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
      <span className="text-[13px] text-[#6B7280]">{label}</span>
      <span className="text-[14px] font-medium text-[#111827]">{value}</span>
    </div>
  )
}

/* ── Manual Invoice Modal ────────────────────────────────────────── */

function ManualInvoiceModal({ onClose, onAdd }) {
  const [vendor, setVendor] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onAdd({
      id: `INV-${2500 + Math.floor(Math.random() * 100)}`,
      vendor: vendor || 'Unknown Vendor',
      amount: `₦${Number(amount || 0).toLocaleString()}`,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: dueDate || 'TBD',
      status: 'pending',
      items: [
        { description: description || 'Services rendered', qty: 1, unitPrice: `₦${Number(amount || 0).toLocaleString()}`, total: `₦${Number(amount || 0).toLocaleString()}` },
      ],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Add Invoice Manually</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Vendor name" placeholder="e.g. Apex Supplies Ltd" value={vendor} onChange={setVendor} required />
          <Field label="Amount (₦)" placeholder="0" value={amount} onChange={setAmount} type="number" required />
          <Field label="Due date" value={dueDate} onChange={setDueDate} type="date" required />
          <Field label="Description" placeholder="What is this invoice for?" value={description} onChange={setDescription} />

          <button
            type="submit"
            disabled={!vendor || !amount}
            className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Add Invoice
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#111827] mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  )
}

/* ── Invoice Detail Drawer ───────────────────────────────────────── */

function InvoiceDetail({ invoice, onClose }) {
  const cfg = statusConfig[invoice.status]
  const StatusIcon = cfg.icon

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
              <HiOutlineDocumentText size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#111827]">{invoice.id}</h3>
              <p className="text-[13px] text-[#6B7280]">{invoice.vendor}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + amount */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium ${cfg.cls}`}>
              <StatusIcon size={16} />
              {cfg.label}
            </span>
            <p className="text-[28px] font-bold text-[#111827] tracking-tight">{invoice.amount}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Vendor" value={invoice.vendor} />
            <DetailField label="Invoice ID" value={invoice.id} />
            <DetailField label="Issue Date" value={invoice.issueDate} />
            <DetailField label="Due Date" value={invoice.dueDate} />
          </div>

          {/* Line items */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider mb-3">Line Items</h4>
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase">Item</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase text-center">Qty</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase text-right">Price</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-[#E5E7EB] last:border-0">
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{item.description}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280] text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280] text-right">{item.unitPrice}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-[#111827] text-right">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#E5E7EB]">
                <span className="text-[13px] font-semibold text-[#111827]">Total</span>
                <span className="text-[16px] font-bold text-[#111827]">{invoice.amount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {invoice.status === 'pending' && (
              <>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#059669] text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all">
                  <HiOutlineCheckCircle size={18} />
                  Approve
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#DC2626] text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all">
                  <HiOutlineXCircle size={18} />
                  Reject
                </button>
              </>
            )}
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <HiOutlinePencilSquare size={18} />
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#FECACA] text-[14px] font-medium text-[#DC2626] rounded-xl hover:bg-[#FEF2F2] transition-colors">
              <HiOutlineTrash size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[14px] font-medium text-[#111827]">{value}</p>
    </div>
  )
}
