'use client'

import { useState } from 'react'
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'

const INITIAL_VENDORS = [
  { id: 1, name: 'Apex Supplies Ltd', category: 'Office Supplies', contact: 'Chidi Okoro', email: 'chidi@apexsupplies.ng', phone: '+234 812 345 6789', address: '12 Marina Rd, Lagos', bankName: 'Access Bank', accountNo: '0012345678', totalPaid: '₦8,450,000', invoiceCount: 12, joined: 'Jan 2024', initials: 'AS', color: 'bg-[#F3F0FF] text-primary', status: 'active' },
  { id: 2, name: 'NovaTech Systems', category: 'IT Services', contact: 'Yemi Alade', email: 'yemi@novatech.ng', phone: '+234 813 456 7890', address: '5 Akin Adesola St, VI', bankName: 'GTBank', accountNo: '0234567890', totalPaid: '₦4,200,000', invoiceCount: 8, joined: 'Mar 2023', initials: 'NT', color: 'bg-[#EFF6FF] text-[#2563EB]', status: 'active' },
  { id: 3, name: 'Meridian Logistics', category: 'Logistics', contact: 'Funke Balogun', email: 'funke@meridian.ng', phone: '+234 814 567 8901', address: '22 Apapa Rd, Lagos', bankName: 'First Bank', accountNo: '3456789012', totalPaid: '₦12,600,000', invoiceCount: 18, joined: 'Jun 2023', initials: 'ML', color: 'bg-[#ECFDF5] text-[#059669]', status: 'active' },
  { id: 4, name: 'Greenfield Agritech', category: 'Agriculture', contact: 'Ibrahim Danjuma', email: 'ibrahim@greenfield.ng', phone: '+234 815 678 9012', address: '8 Kaduna Rd, Abuja', bankName: 'Zenith Bank', accountNo: '4567890123', totalPaid: '₦3,100,000', invoiceCount: 5, joined: 'Sep 2024', initials: 'GA', color: 'bg-[#F0FDF4] text-[#16A34A]', status: 'active' },
  { id: 5, name: 'Horizon Energy', category: 'Energy', contact: 'Amaka Nnaji', email: 'amaka@horizon.ng', phone: '+234 816 789 0123', address: '15 Trans Amadi, PH', bankName: 'UBA', accountNo: '5678901234', totalPaid: '₦9,800,000', invoiceCount: 14, joined: 'Feb 2024', initials: 'HE', color: 'bg-[#FFF7ED] text-[#D97706]', status: 'active' },
  { id: 6, name: 'Zenith Cleaning Co.', category: 'Facility Mgmt', contact: 'Tolu Bakare', email: 'tolu@zenithclean.ng', phone: '+234 817 890 1234', address: '3 Allen Ave, Ikeja', bankName: 'Stanbic IBTC', accountNo: '6789012345', totalPaid: '₦1,920,000', invoiceCount: 6, joined: 'Nov 2024', initials: 'ZC', color: 'bg-[#FCE7F3] text-[#BE185D]', status: 'suspended' },
  { id: 7, name: 'PrimeBuild Construction', category: 'Construction', contact: 'Bola Adeniyi', email: 'bola@primebuild.ng', phone: '+234 818 901 2345', address: '40 Ikorodu Rd, Lagos', bankName: 'Fidelity Bank', accountNo: '7890123456', totalPaid: '₦22,500,000', invoiceCount: 9, joined: 'Aug 2023', initials: 'PB', color: 'bg-[#E0E7FF] text-[#4338CA]', status: 'active' },
  { id: 8, name: 'CloudServe Nigeria', category: 'IT Services', contact: 'Segun Martins', email: 'segun@cloudserve.ng', phone: '+234 819 012 3456', address: '7 Ozumba Mbadiwe, VI', bankName: 'Wema Bank', accountNo: '8901234567', totalPaid: '₦2,750,000', invoiceCount: 4, joined: 'Jan 2025', initials: 'CS', color: 'bg-[#FEF3C7] text-[#B45309]', status: 'blacklisted' },
]

const CATEGORIES = ['All', ...new Set(INITIAL_VENDORS.map((v) => v.category))]

const vendorStatusConfig = {
  active: { label: 'Active', cls: 'text-[#059669] bg-[#ECFDF5]' },
  suspended: { label: 'Suspended', cls: 'text-[#D97706] bg-[#FFF7ED]' },
  blacklisted: { label: 'Blacklisted', cls: 'text-[#DC2626] bg-[#FEF2F2]' },
}

export default function VendorsView() {
  const [vendors, setVendors] = useState(INITIAL_VENDORS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = vendors.filter((v) => {
    const matchCat = category === 'All' || v.category === category
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function updateVendorStatus(id, newStatus) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)))
    setSelectedVendor((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev))
  }

  function handleAddVendor(vendor) {
    setVendors((prev) => [vendor, ...prev])
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">Vendors</h2>
          <p className="text-[13px] text-[#6B7280]">{vendors.length} registered vendors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg w-full sm:w-[220px]">
            <HiOutlineMagnifyingGlass size={16} className="text-[#9CA3AF]" />
            <input type="text" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full" />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap">
            <HiOutlinePlus size={18} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${category === c ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Vendor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((vendor) => {
          const stCfg = vendorStatusConfig[vendor.status] || vendorStatusConfig.active
          return (
            <button key={vendor.id} onClick={() => setSelectedVendor(vendor)} className="bg-white rounded-xl border border-[#E5E7EB] p-5 text-left hover:shadow-md hover:border-[#D1D5DB] transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${vendor.color}`}>
                  {vendor.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#111827] truncate group-hover:text-primary transition-colors">{vendor.name}</p>
                  <p className="text-[13px] text-[#6B7280]">{vendor.contact}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[12px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">{vendor.category}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${stCfg.cls}`}>{stCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-[#6B7280]">
                    <span className="flex items-center gap-1"><HiOutlineBanknotes size={14} />{vendor.totalPaid}</span>
                    <span className="flex items-center gap-1"><HiOutlineDocumentText size={14} />{vendor.invoiceCount} invoices</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[14px] text-[#9CA3AF]">No vendors match your search</div>
      )}

      {selectedVendor && (
        <VendorDetailDrawer vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onUpdateStatus={updateVendorStatus} />
      )}

      {addOpen && <AddVendorModal onClose={() => setAddOpen(false)} onAdd={handleAddVendor} />}
    </div>
  )
}

/* ── Vendor Detail Drawer ────────────────────────────────────────── */

function VendorDetailDrawer({ vendor, onClose, onUpdateStatus }) {
  const [confirmAction, setConfirmAction] = useState(null)
  const stCfg = vendorStatusConfig[vendor.status] || vendorStatusConfig.active

  const invoiceHistory = [
    { id: 'INV-2401', amount: '₦2,450,000', date: 'May 1, 2026', status: 'approved' },
    { id: 'INV-2318', amount: '₦1,200,000', date: 'Apr 12, 2026', status: 'approved' },
    { id: 'INV-2290', amount: '₦890,000', date: 'Mar 20, 2026', status: 'pending' },
    { id: 'INV-2245', amount: '₦3,100,000', date: 'Feb 8, 2026', status: 'approved' },
    { id: 'INV-2201', amount: '₦750,000', date: 'Jan 15, 2026', status: 'rejected' },
  ]

  function handleConfirm() {
    if (!confirmAction) return
    onUpdateStatus(vendor.id, confirmAction.newStatus)
    setConfirmAction(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold ${vendor.color}`}>
              {vendor.initials}
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#111827]">{vendor.name}</h3>
              <p className="text-[13px] text-[#6B7280]">{vendor.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3F0FF] rounded-lg p-3 text-center">
              <p className="text-[18px] font-bold text-primary">{vendor.totalPaid}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Total Paid</p>
            </div>
            <div className="bg-[#ECFDF5] rounded-lg p-3 text-center">
              <p className="text-[18px] font-bold text-[#059669]">{vendor.invoiceCount}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Invoices</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-lg p-3 text-center">
              <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${stCfg.cls}`}>{stCfg.label}</span>
              <p className="text-[11px] text-[#6B7280] mt-1.5">Status</p>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Contact Details</h4>
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <InfoRow icon={HiOutlineBuildingStorefront} label="Contact Person" value={vendor.contact} />
              <InfoRow icon={HiOutlineEnvelope} label="Email" value={vendor.email} />
              <InfoRow icon={HiOutlinePhone} label="Phone" value={vendor.phone} />
              <InfoRow icon={HiOutlineMapPin} label="Address" value={vendor.address} />
              <InfoRow icon={HiOutlineCalendarDays} label="Since" value={vendor.joined} />
            </div>
          </div>

          {/* Bank details */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Bank Details</h4>
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <InfoRow icon={HiOutlineBanknotes} label="Bank" value={vendor.bankName} />
              <InfoRow icon={HiOutlineDocumentText} label="Account No." value={vendor.accountNo} />
            </div>
          </div>

          {/* Invoice history */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Recent Invoices</h4>
            <div className="space-y-2">
              {invoiceHistory.map((inv) => {
                const cfg = invStatusConfig[inv.status]
                const Icon = cfg.icon
                return (
                  <div key={inv.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
                      <HiOutlineDocumentText size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#111827]">{inv.id}</p>
                      <p className="text-[12px] text-[#9CA3AF]">{inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-[#111827]">{inv.amount}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${cfg.cls}`}>
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Actions</h4>

            {vendor.status === 'active' && (
              <div className="space-y-2">
                <ActionBtn icon={HiOutlineNoSymbol} iconColor="text-[#D97706]" borderColor="border-[#FED7AA]" hoverBg="hover:bg-[#FFF7ED]" title="Suspend vendor" subtitle="Pause all transactions temporarily" onClick={() => setConfirmAction({ newStatus: 'suspended', title: 'Suspend Vendor', description: `Suspend ${vendor.name}? All pending invoices and payments will be paused.`, buttonLabel: 'Suspend', buttonCls: 'bg-[#D97706] hover:bg-[#B45309]' })} />
                <ActionBtn icon={HiOutlineExclamationTriangle} iconColor="text-[#DC2626]" borderColor="border-[#FECACA]" hoverBg="hover:bg-[#FEF2F2]" title="Blacklist vendor" subtitle="Permanently block from future business" onClick={() => setConfirmAction({ newStatus: 'blacklisted', title: 'Blacklist Vendor', description: `Blacklist ${vendor.name}? They will be permanently blocked from submitting invoices and receiving payments.`, buttonLabel: 'Blacklist', buttonCls: 'bg-[#DC2626] hover:bg-[#B91C1C]' })} />
              </div>
            )}

            {vendor.status === 'suspended' && (
              <div className="space-y-2">
                <ActionBtn icon={HiOutlineArrowPath} iconColor="text-[#059669]" borderColor="border-[#A7F3D0]" hoverBg="hover:bg-[#ECFDF5]" title="Reactivate vendor" subtitle="Resume all transactions" onClick={() => setConfirmAction({ newStatus: 'active', title: 'Reactivate Vendor', description: `Reactivate ${vendor.name}? They will be able to submit invoices and receive payments again.`, buttonLabel: 'Reactivate', buttonCls: 'bg-[#059669] hover:bg-[#047857]' })} />
                <ActionBtn icon={HiOutlineExclamationTriangle} iconColor="text-[#DC2626]" borderColor="border-[#FECACA]" hoverBg="hover:bg-[#FEF2F2]" title="Blacklist vendor" subtitle="Permanently block from future business" onClick={() => setConfirmAction({ newStatus: 'blacklisted', title: 'Blacklist Vendor', description: `Blacklist ${vendor.name}? This action cannot be undone easily.`, buttonLabel: 'Blacklist', buttonCls: 'bg-[#DC2626] hover:bg-[#B91C1C]' })} />
              </div>
            )}

            {vendor.status === 'blacklisted' && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                <p className="text-[13px] text-[#991B1B]">This vendor has been blacklisted. No further transactions allowed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal title={confirmAction.title} description={confirmAction.description} buttonLabel={confirmAction.buttonLabel} buttonCls={confirmAction.buttonCls} onConfirm={handleConfirm} onCancel={() => setConfirmAction(null)} />
      )}
    </div>
  )
}

/* ── Add Vendor Modal ────────────────────────────────────────────── */

function AddVendorModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: '', contact: '', email: '', phone: '', address: '', bankName: '', accountNo: '' })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const initials = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    const colors = ['bg-[#F3F0FF] text-primary', 'bg-[#EFF6FF] text-[#2563EB]', 'bg-[#ECFDF5] text-[#059669]', 'bg-[#FFF7ED] text-[#D97706]', 'bg-[#FDF2F8] text-[#DB2777]']
    onAdd({
      id: Date.now(),
      name: form.name,
      category: form.category || 'General',
      contact: form.contact,
      email: form.email,
      phone: form.phone,
      address: form.address,
      bankName: form.bankName,
      accountNo: form.accountNo,
      totalPaid: '₦0',
      invoiceCount: 0,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      initials,
      color: colors[Math.floor(Math.random() * colors.length)],
      status: 'active',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Add New Vendor</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Company name" placeholder="e.g. Apex Supplies Ltd" value={form.name} onChange={(v) => update('name', v)} required />
          <Field label="Category" placeholder="e.g. IT Services, Logistics" value={form.category} onChange={(v) => update('category', v)} />
          <Field label="Contact person" placeholder="Full name" value={form.contact} onChange={(v) => update('contact', v)} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" placeholder="vendor@email.com" value={form.email} onChange={(v) => update('email', v)} type="email" />
            <Field label="Phone" placeholder="+234..." value={form.phone} onChange={(v) => update('phone', v)} />
          </div>
          <Field label="Address" placeholder="Office address" value={form.address} onChange={(v) => update('address', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank name" placeholder="e.g. Access Bank" value={form.bankName} onChange={(v) => update('bankName', v)} />
            <Field label="Account number" placeholder="0123456789" value={form.accountNo} onChange={(v) => update('accountNo', v)} />
          </div>

          <button type="submit" disabled={!form.name || !form.contact} className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40">
            Add Vendor
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Confirmation Modal ──────────────────────────────────────────── */

function ConfirmModal({ title, description, buttonLabel, buttonCls, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationTriangle size={24} className="text-[#DC2626]" />
        </div>
        <h3 className="text-[17px] font-semibold text-[#111827] text-center mb-2">{title}</h3>
        <p className="text-[14px] text-[#6B7280] text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 text-white text-[14px] font-semibold rounded-xl transition-all active:scale-[0.98] ${buttonCls}`}>{buttonLabel}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────── */

const invStatusConfig = {
  approved: { label: 'Approved', icon: HiOutlineCheckCircle, cls: 'text-[#059669] bg-[#ECFDF5]' },
  pending: { label: 'Pending', icon: HiOutlineClock, cls: 'text-[#D97706] bg-[#FFF7ED]' },
  rejected: { label: 'Rejected', icon: HiOutlineXCircle, cls: 'text-[#DC2626] bg-[#FEF2F2]' },
}

function ActionBtn({ icon: Icon, iconColor, borderColor, hoverBg, title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 border ${borderColor} rounded-xl text-left ${hoverBg} transition-colors`}>
      <Icon size={20} className={iconColor} />
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{title}</p>
        <p className="text-[12px] text-[#6B7280]">{subtitle}</p>
      </div>
    </button>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-[#9CA3AF] shrink-0" />
      <span className="text-[13px] text-[#6B7280] w-28 shrink-0">{label}</span>
      <span className="text-[14px] font-medium text-[#111827] truncate">{value}</span>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#111827] mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
    </div>
  )
}
