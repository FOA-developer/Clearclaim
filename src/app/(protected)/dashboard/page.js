import StatCards from '@/components/dashboard/StatCards'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import TopStaff from '@/components/dashboard/TopStaff'
import VendorInvoices from '@/components/dashboard/VendorInvoices'

const stats = [
  {
    type: 'spent',
    label: 'Total spent this month',
    value: '₦18,450,000',
    trend: '+12.4%',
    trendDirection: 'up',
  },
  {
    type: 'received',
    label: 'Total received this month',
    value: '₦32,800,000',
    trend: '+8.2%',
    trendDirection: 'up',
  },
  {
    type: 'invoices',
    label: 'Vendor invoice requests',
    value: '47',
    trend: '+3 new',
    trendDirection: 'up',
  },
  {
    type: 'attendance',
    label: 'Staff attendance rate',
    value: '94.2%',
    trend: '-1.8%',
    trendDirection: 'down',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[16px] font-semibold text-[#111827]">Overview</h2>
        <p className="text-[13px] text-[#6B7280]">Your business at a glance for May 2026</p>
      </div>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <AttendanceChart />
        </div>
        <div className="xl:col-span-2">
          <TopStaff />
        </div>
      </div>

      <VendorInvoices />
    </div>
  )
}
