'use client'

import { useState } from 'react'
import {
  HiOutlineArrowUpRight,
  HiOutlineArrowDownLeft,
  HiOutlineBanknotes,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePaperAirplane,
  HiOutlineQrCode,
  HiOutlineArrowsRightLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineClipboard,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'

const TRANSACTIONS = [
  { id: 'TXN-3401', type: 'out', name: 'Apex Supplies Ltd', amount: '₦2,450,000', date: 'May 14, 2026', status: 'completed', category: 'Vendor' },
  { id: 'TXN-3402', type: 'in', name: 'Client Payment — Meridian', amount: '₦8,200,000', date: 'May 13, 2026', status: 'completed', category: 'Revenue' },
  { id: 'TXN-3403', type: 'out', name: 'Payroll — May Cycle 1', amount: '₦5,600,000', date: 'May 12, 2026', status: 'completed', category: 'Payroll' },
  { id: 'TXN-3404', type: 'in', name: 'Greenfield Agritech', amount: '₦3,100,000', date: 'May 11, 2026', status: 'pending', category: 'Revenue' },
  { id: 'TXN-3405', type: 'out', name: 'NovaTech Systems', amount: '₦890,000', date: 'May 10, 2026', status: 'failed', category: 'Vendor' },
  { id: 'TXN-3406', type: 'in', name: 'Horizon Energy', amount: '₦4,500,000', date: 'May 10, 2026', status: 'completed', category: 'Revenue' },
  { id: 'TXN-3407', type: 'out', name: 'Office Lease — Q2', amount: '₦1,200,000', date: 'May 9, 2026', status: 'completed', category: 'Operations' },
]

const statusConfig = {
  completed: { label: 'Completed', icon: HiOutlineCheckCircle, cls: 'text-[#059669] bg-[#ECFDF5]' },
  pending: { label: 'Pending', icon: HiOutlineClock, cls: 'text-[#D97706] bg-[#FFF7ED]' },
  failed: { label: 'Failed', icon: HiOutlineXCircle, cls: 'text-[#DC2626] bg-[#FEF2F2]' },
}

const FILTERS = ['All', 'Incoming', 'Outgoing']

export default function PaymentsPage() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [filter, setFilter] = useState('All')
  const [sendOpen, setSendOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const filtered = TRANSACTIONS.filter((t) => {
    if (filter === 'Incoming') return t.type === 'in'
    if (filter === 'Outgoing') return t.type === 'out'
    return true
  })

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Wallet card */}
      <div className="bg-gradient-to-br from-[#4f378a] to-[#7c5cbf] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineBanknotes size={20} className="text-white/70" />
            <span className="text-[14px] text-white/70 font-medium">Available Balance</span>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="ml-1 text-white/50 hover:text-white/80 transition-colors">
              {balanceVisible ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
          </div>
          <p className="text-[36px] md:text-[42px] font-bold tracking-tight mb-6">
            {balanceVisible ? '₦24,860,000' : '₦••••••••'}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSendOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#4f378a] text-[14px] font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <HiOutlinePaperAirplane size={18} />
              Send Money
            </button>
            <button
              onClick={() => setReceiveOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white text-[14px] font-semibold rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all border border-white/20"
            >
              <HiOutlineQrCode size={18} />
              Receive
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat icon={HiOutlineArrowUpRight} iconCls="text-[#DC2626] bg-[#FEF2F2]" label="Sent this month" value="₦10,140,000" />
        <MiniStat icon={HiOutlineArrowDownLeft} iconCls="text-[#059669] bg-[#ECFDF5]" label="Received this month" value="₦15,800,000" />
        <MiniStat icon={HiOutlineArrowsRightLeft} iconCls="text-primary bg-[#F3F0FF]" label="Total transactions" value="24" />
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="p-5 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">Transaction History</h3>
            <p className="text-[13px] text-[#6B7280]">All wallet transactions</p>
          </div>
          <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${filter === f ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Transaction</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Category</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Date</th>
                <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Amount</th>
                <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const cfg = statusConfig[tx.status]
                const StatusIcon = cfg.icon
                return (
                  <tr key={tx.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === 'in' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                          {tx.type === 'in'
                            ? <HiOutlineArrowDownLeft size={18} className="text-[#059669]" />
                            : <HiOutlineArrowUpRight size={18} className="text-[#DC2626]" />}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#111827]">{tx.name}</p>
                          <p className="text-[12px] text-[#9CA3AF]">{tx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md">{tx.category}</span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#6B7280]">{tx.date}</td>
                    <td className={`px-5 py-4 text-right text-[14px] font-semibold ${tx.type === 'in' ? 'text-[#059669]' : 'text-[#111827]'}`}>
                      {tx.type === 'in' ? '+' : '−'}{tx.amount}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium ${cfg.cls}`}>
                        <StatusIcon size={14} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="sm:hidden divide-y divide-[#F3F4F6]">
          {filtered.map((tx) => {
            const cfg = statusConfig[tx.status]
            const StatusIcon = cfg.icon
            return (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                  {tx.type === 'in'
                    ? <HiOutlineArrowDownLeft size={18} className="text-[#059669]" />
                    : <HiOutlineArrowUpRight size={18} className="text-[#DC2626]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#111827] truncate">{tx.name}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[14px] font-semibold ${tx.type === 'in' ? 'text-[#059669]' : 'text-[#111827]'}`}>
                    {tx.type === 'in' ? '+' : '−'}{tx.amount}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${cfg.cls}`}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Send Money Modal */}
      {sendOpen && <SendMoneyModal onClose={() => setSendOpen(false)} />}

      {/* Receive Modal */}
      {receiveOpen && <ReceiveModal onClose={() => setReceiveOpen(false)} />}
    </div>
  )
}

function MiniStat({ icon: Icon, iconCls, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconCls}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[13px] text-[#6B7280]">{label}</p>
        <p className="text-[18px] font-bold text-[#111827]">{value}</p>
      </div>
    </div>
  )
}

function SendMoneyModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [narration, setNarration] = useState('')

  function handleSend(e) {
    e.preventDefault()
    setStep(2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">
            {step === 1 ? 'Send Money' : 'Transfer Successful'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            <ModalField label="Bank name" placeholder="e.g. Access Bank" value={bank} onChange={setBank} />
            <ModalField label="Account number" placeholder="0123456789" value={account} onChange={setAccount} />
            <ModalField label="Amount (₦)" placeholder="0.00" value={amount} onChange={setAmount} type="number" />
            <ModalField label="Narration (optional)" placeholder="Payment for..." value={narration} onChange={setNarration} />
            <button
              type="submit"
              disabled={!bank || !account || !amount}
              className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Send ₦{amount ? Number(amount).toLocaleString() : '0'}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle size={32} className="text-[#059669]" />
            </div>
            <p className="text-[20px] font-bold text-[#111827] mb-1">₦{Number(amount).toLocaleString()}</p>
            <p className="text-[14px] text-[#6B7280] mb-6">Sent to {account} ({bank})</p>
            <button onClick={onClose} className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiveModal({ onClose }) {
  const acctNo = '0012345678'
  const bankName = 'ClearClaim Finance'
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(acctNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Receive Payment</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[13px] text-[#6B7280] mb-4">Share your account details to receive payments</p>

          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
            <div>
              <p className="text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-1">Bank Name</p>
              <p className="text-[15px] font-semibold text-[#111827]">{bankName}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-1">Account Number</p>
              <div className="flex items-center gap-2">
                <p className="text-[22px] font-bold text-[#111827] tracking-wide">{acctNo}</p>
                <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-[#E5E7EB] transition-colors" title="Copy">
                  {copied ? <HiOutlineCheckCircle size={18} className="text-[#059669]" /> : <HiOutlineClipboard size={18} className="text-[#6B7280]" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-1">Account Name</p>
              <p className="text-[15px] font-semibold text-[#111827]">ClearClaim Insurance Ltd</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl flex items-start gap-2.5">
            <HiOutlineExclamationCircle size={18} className="text-[#D97706] mt-0.5 shrink-0" />
            <p className="text-[13px] text-[#92400E]">Transfers typically arrive within 1–5 minutes during business hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#111827] mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  )
}
