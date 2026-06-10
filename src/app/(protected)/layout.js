import Sidebar from '@/components/shared/Sidebar'
import TopBar from '@/components/shared/TopBar'
import BottomNav from '@/components/shared/BottomNav'

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="md:ml-[240px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
