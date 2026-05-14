import StatCards from '@/components/dashboard/StatCards'
import VerificationFeed from '@/components/dashboard/VerificationFeed'
import PaymentLedger from '@/components/dashboard/PaymentLedger'
import WebhookLog from '@/components/dashboard/WebhookLog'

const stats = [
  {
    label: 'Total Claims Today',
    value: '1,402',
    trend: '+12%',
    trendIcon: 'trending_up',
    trendColor: 'text-tertiary'
  },
  {
    label: 'Pass Rate %',
    value: '94.2%',
    trend: 'Optimal',
    trendIcon: 'check_circle',
    trendColor: 'text-primary'
  },
  {
    label: 'Active Reviews',
    value: '87',
    trend: 'Requires Action',
    trendIcon: 'priority_high',
    trendColor: 'text-error'
  },
  {
    label: 'Squad Payments',
    value: '$42.8k',
    trend: 'Released',
    trendIcon: 'payments',
    trendColor: 'text-tertiary'
  }
]

const feedItems = [
  {
    id: 'feed-1',
    icon: 'medical_services',
    iconBg: 'bg-primary-container',
    iconColor: 'text-primary',
    title: 'Medical Claim #8192',
    subtitle: 'St. Jude Medical Group',
    badge: 'High Trust',
    badgeStyle: 'bg-secondary-container text-on-secondary-container'
  },
  {
    id: 'feed-2',
    icon: 'directions_car',
    iconBg: 'bg-tertiary-container',
    iconColor: 'text-on-tertiary-container',
    title: 'Auto Incident #8191',
    subtitle: 'Premium Auto Insure',
    badge: 'Audit Flag',
    badgeStyle: 'bg-error-container text-on-error-container'
  },
  {
    id: 'feed-3',
    icon: 'home',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-primary',
    title: 'Property Damage #8190',
    subtitle: 'Westside Real Estate',
    badge: 'Medium Trust',
    badgeStyle: 'bg-secondary-container text-on-secondary-container'
  }
]

const ledgerItems = [
  {
    id: 'ALPHA-SQ-29',
    amount: '$12,450.00',
    status: 'PROCESSED',
    statusIcon: 'check_circle',
    statusColor: 'text-tertiary'
  },
  {
    id: 'DELTA-SQ-04',
    amount: '$8,120.50',
    status: 'PENDING',
    statusIcon: 'schedule',
    statusColor: 'text-primary'
  },
  {
    id: 'ZETA-SQ-11',
    amount: '$22,000.00',
    status: 'PROCESSED',
    statusIcon: 'check_circle',
    statusColor: 'text-tertiary'
  },
  {
    id: 'SIGMA-SQ-88',
    amount: '$1,240.00',
    status: 'HELD',
    statusIcon: 'cancel',
    statusColor: 'text-error'
  }
]

const webhookLogs = [
  {
    id: 'log-1',
    timestamp: '2023-10-24 14:22:01',
    message: 'POST /v1/claims/verify/8192 200 OK',
    color: 'text-[#27C93F]',
    highlight: true
  },
  {
    id: 'log-2',
    timestamp: '2023-10-24 14:22:05',
    message: 'DEBUG: Verification engine confidence: 0.982',
    color: 'text-white/70',
    highlight: false
  },
  {
    id: 'log-3',
    timestamp: '2023-10-24 14:22:12',
    message: 'WARN: Metadata mismatch on Auto Incident #8191 - Requesting secondary audit',
    color: 'text-[#FFBD2E]',
    highlight: false
  },
  {
    id: 'log-4',
    timestamp: '2023-10-24 14:22:15',
    message: 'ERROR: Ledger connection timeout on SIGMA-SQ-88 - retrying...',
    color: 'text-[#FF5F56]',
    highlight: false
  },
  {
    id: 'log-5',
    timestamp: '2023-10-24 14:22:20',
    message: 'EVENT: Squad Payment Released (ALPHA-SQ-29) - $12,450.00',
    color: 'text-[#27C93F]',
    highlight: false
  }
]

export default function DashboardPage() {
  return (
    <main className="mt-20 px-4 md:px-8 max-w-[1280px] mx-auto space-y-6 pb-24">
      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerificationFeed items={feedItems} />
        <PaymentLedger items={ledgerItems} />
      </div>

      <WebhookLog logs={webhookLogs} />
    </main>
  )
}