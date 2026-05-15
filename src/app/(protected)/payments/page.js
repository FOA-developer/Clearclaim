'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'
import { NIGERIAN_BANKS } from '@/lib/constants/banks'

const statusConfig = {
  completed: { label: 'Completed', icon: HiOutlineCheckCircle, cls: 'text-[#059669] bg-[#ECFDF5]' },
  success: { label: 'Completed', icon: HiOutlineCheckCircle, cls: 'text-[#059669] bg-[#ECFDF5]' },
  pending: { label: 'Pending', icon: HiOutlineClock, cls: 'text-[#D97706] bg-[#FFF7ED]' },
  failed: { label: 'Failed', icon: HiOutlineXCircle, cls: 'text-[#DC2626] bg-[#FEF2F2]' },
  reversed: { label: 'Reversed', icon: HiOutlineArrowsRightLeft, cls: 'text-[#6B7280] bg-[#F3F4F6]' },
}

const FILTERS = ['All', 'Incoming', 'Outgoing']

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PaymentsPage() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [filter, setFilter] = useState('All')
  const [sendOpen, setSendOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const [balance, setBalance] = useState(null)
  const [virtualAccount, setVirtualAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/balance')
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
        setVirtualAccount(data.virtualAccount)
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true)
    try {
      const res = await fetch('/api/wallet/transactions?limit=50')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions ?? [])
      }
    } catch {
      /* silent */
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
    fetchTransactions()
  }, [fetchBalance, fetchTransactions])

  const handleTransferComplete = useCallback(() => {
    fetchBalance()
    fetchTransactions()
  }, [fetchBalance, fetchTransactions])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter === 'Incoming') return t.type === 'credit'
      if (filter === 'Outgoing') return t.type === 'debit'
      return true
    })
  }, [transactions, filter])

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = transactions.filter((t) => new Date(t.date) >= monthStart)

    const sent = thisMonth
      .filter((t) => t.type === 'debit' && (t.status === 'success' || t.status === 'completed'))
      .reduce((s, t) => s + t.amount, 0)

    const received = thisMonth
      .filter((t) => t.type === 'credit')
      .reduce((s, t) => s + t.amount, 0)

    return { sent, received, total: thisMonth.length }
  }, [transactions])

  const balanceAmount = balance?.amountNaira ?? 0

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
            <button onClick={fetchBalance} className="ml-auto text-white/50 hover:text-white/80 transition-colors" title="Refresh balance">
              <HiOutlineArrowPath size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-[36px] md:text-[42px] font-bold tracking-tight mb-6">
            {loading ? (
              <span className="inline-block w-48 h-10 bg-white/10 rounded-lg animate-pulse" />
            ) : balanceVisible ? (
              formatNaira(balanceAmount)
            ) : (
              '₦••••••••'
            )}
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
        <MiniStat icon={HiOutlineArrowUpRight} iconCls="text-[#DC2626] bg-[#FEF2F2]" label="Sent this month" value={formatNaira(stats.sent)} />
        <MiniStat icon={HiOutlineArrowDownLeft} iconCls="text-[#059669] bg-[#ECFDF5]" label="Received this month" value={formatNaira(stats.received)} />
        <MiniStat icon={HiOutlineArrowsRightLeft} iconCls="text-primary bg-[#F3F0FF]" label="Total transactions" value={String(stats.total)} />
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
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${filter === f ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="p-8 text-center">
            <HiOutlineArrowPath size={24} className="mx-auto text-[#9CA3AF] animate-spin mb-2" />
            <p className="text-[13px] text-[#9CA3AF]">Loading transactions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <HiOutlineBanknotes size={32} className="mx-auto text-[#D1D5DB] mb-2" />
            <p className="text-[14px] text-[#9CA3AF]">No transactions yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F4F6]">
                    <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Transaction</th>
                    <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Channel</th>
                    <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Date</th>
                    <th className="text-right text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Amount</th>
                    <th className="text-left text-[12px] font-medium text-[#9CA3AF] px-5 py-3 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const cfg = statusConfig[tx.status] ?? statusConfig.pending
                    const StatusIcon = cfg.icon
                    const isCredit = tx.type === 'credit'
                    return (
                      <tr key={tx.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isCredit ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                              {isCredit
                                ? <HiOutlineArrowDownLeft size={18} className="text-[#059669]" />
                                : <HiOutlineArrowUpRight size={18} className="text-[#DC2626]" />}
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-[#111827]">
                                {isCredit ? (tx.senderName || tx.description) : (tx.recipientName || tx.description)}
                              </p>
                              <p className="text-[12px] text-[#9CA3AF] truncate max-w-[200px]">{tx.reference}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[13px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md capitalize">{tx.channel}</span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-[#6B7280]">{formatDate(tx.date)}</td>
                        <td className={`px-5 py-4 text-right text-[14px] font-semibold ${isCredit ? 'text-[#059669]' : 'text-[#111827]'}`}>
                          {isCredit ? '+' : '−'}{formatNaira(tx.amount)}
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
                const cfg = statusConfig[tx.status] ?? statusConfig.pending
                const StatusIcon = cfg.icon
                const isCredit = tx.type === 'credit'
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                      {isCredit
                        ? <HiOutlineArrowDownLeft size={18} className="text-[#059669]" />
                        : <HiOutlineArrowUpRight size={18} className="text-[#DC2626]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#111827] truncate">
                        {isCredit ? (tx.senderName || tx.description) : (tx.recipientName || tx.description)}
                      </p>
                      <p className="text-[12px] text-[#9CA3AF]">{formatDate(tx.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[14px] font-semibold ${isCredit ? 'text-[#059669]' : 'text-[#111827]'}`}>
                        {isCredit ? '+' : '−'}{formatNaira(tx.amount)}
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
          </>
        )}
      </div>

      {sendOpen && <SendMoneyModal onClose={() => setSendOpen(false)} onSuccess={handleTransferComplete} />}
      {receiveOpen && (
        <ReceiveModal
          onClose={() => setReceiveOpen(false)}
          virtualAccount={virtualAccount}
          onAccountCreated={(va) => {
            setVirtualAccount(va)
            fetchBalance()
          }}
        />
      )}
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

function SendMoneyModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [bankCode, setBankCode] = useState('')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [bankSearch, setBankSearch] = useState('')

  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupError, setLookupError] = useState('')

  const [transferLoading, setTransferLoading] = useState(false)
  const [transferResult, setTransferResult] = useState(null)
  const [transferError, setTransferError] = useState('')

  const filteredBanks = useMemo(() => {
    if (!bankSearch) return NIGERIAN_BANKS
    const q = bankSearch.toLowerCase()
    return NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(q))
  }, [bankSearch])

  const selectedBank = NIGERIAN_BANKS.find((b) => b.code === bankCode)

  useEffect(() => {
    if (account.length === 10 && bankCode) {
      handleLookup()
    } else {
      setLookupResult(null)
      setLookupError('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, bankCode])

  async function handleLookup() {
    setLookupLoading(true)
    setLookupError('')
    setLookupResult(null)
    try {
      const res = await fetch('/api/wallet/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode, accountNumber: account }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLookupError(data.error?.message ?? 'Account lookup failed')
        return
      }
      setLookupResult(data)
    } catch {
      setLookupError('Network error — try again')
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleTransfer(e) {
    e.preventDefault()
    if (!lookupResult) return

    setTransferLoading(true)
    setTransferError('')
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankCode,
          accountNumber: account,
          accountName: lookupResult.accountName,
          amount: parseFloat(amount),
          remark: remark || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTransferError(data.error?.message ?? 'Transfer failed')
        return
      }
      setTransferResult(data)
      setStep(2)
      onSuccess?.()
    } catch {
      setTransferError('Network error — try again')
    } finally {
      setTransferLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">
            {step === 1 ? 'Send Money' : 'Transfer Initiated'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleTransfer} className="p-6 space-y-4">
            {/* Bank selector */}
            <div>
              <label className="block text-[14px] font-medium text-[#111827] mb-1.5">Bank</label>
              <div className="relative">
                <div className="flex items-center border border-[#D1D5DB] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <HiOutlineMagnifyingGlass size={16} className="ml-3 text-[#9CA3AF] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search bank..."
                    value={selectedBank ? selectedBank.name : bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value)
                      setBankCode('')
                    }}
                    onFocus={() => {
                      if (selectedBank) {
                        setBankSearch(selectedBank.name)
                        setBankCode('')
                      }
                    }}
                    className="w-full px-3 py-3 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                  />
                </div>
                {!bankCode && bankSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredBanks.length === 0 ? (
                      <p className="px-4 py-3 text-[13px] text-[#9CA3AF]">No bank found</p>
                    ) : (
                      filteredBanks.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => {
                            setBankCode(b.code)
                            setBankSearch('')
                          }}
                          className="w-full text-left px-4 py-2.5 text-[14px] text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                        >
                          {b.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account number */}
            <div>
              <label className="block text-[14px] font-medium text-[#111827] mb-1.5">Account number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                value={account}
                onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {lookupLoading && (
                <p className="mt-1 text-[12px] text-[#6B7280] flex items-center gap-1">
                  <HiOutlineArrowPath size={12} className="animate-spin" /> Verifying account...
                </p>
              )}
              {lookupResult && (
                <p className="mt-1 text-[12px] text-[#059669] font-medium flex items-center gap-1">
                  <HiOutlineCheckCircle size={14} /> {lookupResult.accountName}
                </p>
              )}
              {lookupError && (
                <p className="mt-1 text-[12px] text-[#DC2626]">{lookupError}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[14px] font-medium text-[#111827] mb-1.5">Amount (₦)</label>
              <input
                type="number"
                placeholder="0.00"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Remark */}
            <div>
              <label className="block text-[14px] font-medium text-[#111827] mb-1.5">Remark (optional)</label>
              <input
                type="text"
                placeholder="Payment for..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {transferError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2">
                <HiOutlineXCircle size={16} className="text-[#DC2626] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#991B1B]">{transferError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!bankCode || !lookupResult || !amount || transferLoading}
              className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {transferLoading ? (
                <>
                  <HiOutlineArrowPath size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>Send {amount ? formatNaira(parseFloat(amount)) : '₦0.00'}</>
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle size={32} className="text-[#059669]" />
            </div>
            <p className="text-[20px] font-bold text-[#111827] mb-1">{formatNaira(transferResult?.amount ?? 0)}</p>
            <p className="text-[14px] text-[#6B7280] mb-1">
              Sent to {transferResult?.accountName}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mb-1">
              {transferResult?.accountNumber} • {transferResult?.destinationBank ?? selectedBank?.name}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mb-6">
              Ref: {transferResult?.transactionReference}
            </p>
            <button onClick={onClose} className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiveModal({ onClose, virtualAccount, onAccountCreated }) {
  const [copied, setCopied] = useState(false)
  const [setting, setSetting] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('')

  const acctNo = virtualAccount?.accountNumber ?? '—'
  const bankName = virtualAccount?.bankName ?? 'GTBank'

  function handleCopy() {
    if (!virtualAccount) return
    navigator.clipboard.writeText(acctNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSetup() {
    setSetting(true)
    setSetupError('')
    try {
      const res = await fetch('/api/wallet/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(beneficiaryAccount && { beneficiaryAccount }),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSetupError(data.error?.message ?? 'Setup failed')
        return
      }
      onAccountCreated?.(data.virtualAccount)
    } catch {
      setSetupError('Network error — try again')
    } finally {
      setSetting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[17px] font-semibold text-[#111827]">Receive Payment</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6">
          {virtualAccount ? (
            <>
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
                {virtualAccount.accountName && (
                  <div>
                    <p className="text-[12px] text-[#9CA3AF] uppercase tracking-wider mb-1">Account Name</p>
                    <p className="text-[15px] font-semibold text-[#111827]">{virtualAccount.accountName}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl flex items-start gap-2.5">
                <HiOutlineExclamationCircle size={18} className="text-[#D97706] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#92400E]">Transfers typically arrive within 1–5 minutes during business hours.</p>
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="text-center mb-5">
                <HiOutlineExclamationCircle size={32} className="mx-auto text-[#D97706] mb-3" />
                <p className="text-[14px] font-medium text-[#111827] mb-1">No virtual account found</p>
                <p className="text-[13px] text-[#6B7280]">
                  Set up your virtual account to start receiving payments.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#111827] mb-1.5">
                    Settlement account (GTBank)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit GTBank account number"
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    Money received will be settled into this GTBank account. If left empty, it goes to your Squad wallet (T+1).
                  </p>
                </div>

                {setupError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2">
                    <HiOutlineXCircle size={16} className="text-[#DC2626] mt-0.5 shrink-0" />
                    <p className="text-[13px] text-[#991B1B]">{setupError}</p>
                  </div>
                )}

                <button
                  onClick={handleSetup}
                  disabled={setting}
                  className="w-full py-3 bg-primary text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {setting ? (
                    <>
                      <HiOutlineArrowPath size={16} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Virtual Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
