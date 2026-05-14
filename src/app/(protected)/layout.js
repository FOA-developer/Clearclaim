import TopBar from '@/components/shared/TopBar'
import BottomNav from '@/components/shared/BottomNav'

export default function ProtectedLayout({ children }) {
  return (
    <div>
      <TopBar />
      {children}
      <BottomNav />
    </div>
  )
}