'use client'

import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineBanknotes,
  HiOutlineArrowDownTray,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

const iconMap = {
  spent: HiOutlineBanknotes,
  received: HiOutlineArrowDownTray,
  invoices: HiOutlineDocumentText,
  attendance: HiOutlineUserGroup,
}

const bgMap = {
  spent: 'bg-[#FEF2F2]',
  received: 'bg-[#ECFDF5]',
  invoices: 'bg-[#F3F0FF]',
  attendance: 'bg-[#FFF7ED]',
}

const iconColorMap = {
  spent: 'text-[#DC2626]',
  received: 'text-[#059669]',
  invoices: 'text-primary',
  attendance: 'text-[#D97706]',
}

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.type] || HiOutlineBanknotes
        const isPositive = stat.trendDirection === 'up'
        const TrendIcon = isPositive ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown

        return (
          <div
            key={stat.type}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgMap[stat.type]}`}>
                <Icon size={20} className={iconColorMap[stat.type]} />
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-medium ${isPositive ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                <TrendIcon size={14} />
                {stat.trend}
              </div>
            </div>
            <p className="text-[26px] font-bold text-[#111827] tracking-tight">{stat.value}</p>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
