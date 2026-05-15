'use client'

import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from 'react-icons/hi2'

const invoices = [
  {
    id: 'INV-2401',
    vendor: 'Apex Supplies Ltd',
    amount: '₦2,450,000',
    date: 'May 14, 2026',
    status: 'approved',
  },
  {
    id: 'INV-2402',
    vendor: 'Greenfield Agritech',
    amount: '₦1,820,500',
    date: 'May 13, 2026',
    status: 'pending',
  },
  {
    id: 'INV-2403',
    vendor: 'Meridian Logistics',
    amount: '₦4,100,000',
    date: 'May 12, 2026',
    status: 'approved',
  },
  {
    id: 'INV-2404',
    vendor: 'NovaTech Systems',
    amount: '₦890,000',
    date: 'May 12, 2026',
    status: 'rejected',
  },
  {
    id: 'INV-2405',
    vendor: 'Horizon Energy',
    amount: '₦3,200,000',
    date: 'May 11, 2026',
    status: 'pending',
  },
]

const statusConfig = {
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
}

export default function VendorInvoices() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Latest Vendor Invoices</h3>
          <p className="text-[13px] text-[#6B7280]">Recent invoice requests</p>
        </div>
        <button className="text-[13px] text-primary font-medium hover:underline">
          View all
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <th className="text-left text-[12px] font-medium text-[#9CA3AF] pb-3 uppercase tracking-wider">Invoice</th>
              <th className="text-left text-[12px] font-medium text-[#9CA3AF] pb-3 uppercase tracking-wider">Vendor</th>
              <th className="text-left text-[12px] font-medium text-[#9CA3AF] pb-3 uppercase tracking-wider">Amount</th>
              <th className="text-left text-[12px] font-medium text-[#9CA3AF] pb-3 uppercase tracking-wider">Date</th>
              <th className="text-left text-[12px] font-medium text-[#9CA3AF] pb-3 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const cfg = statusConfig[inv.status]
              const StatusIcon = cfg.icon
              return (
                <tr key={inv.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 text-[14px] font-medium text-[#111827]">{inv.id}</td>
                  <td className="py-3 text-[14px] text-[#374151]">{inv.vendor}</td>
                  <td className="py-3 text-[14px] font-semibold text-[#111827]">{inv.amount}</td>
                  <td className="py-3 text-[13px] text-[#6B7280]">{inv.date}</td>
                  <td className="py-3">
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
      <div className="sm:hidden space-y-3">
        {invoices.map((inv) => {
          const cfg = statusConfig[inv.status]
          const StatusIcon = cfg.icon
          return (
            <div key={inv.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
              <div>
                <p className="text-[14px] font-medium text-[#111827]">{inv.vendor}</p>
                <p className="text-[12px] text-[#9CA3AF]">{inv.id} &middot; {inv.date}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-semibold text-[#111827]">{inv.amount}</p>
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
  )
}
