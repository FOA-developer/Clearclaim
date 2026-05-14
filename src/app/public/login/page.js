import LoginCard from '@/components/login/LoginCard'

export const metadata = {
  title: 'Login | ClearClaim',
}

export default function LoginPage() {
  return (
    <body className="bg-surface font-body-md text-on-surface min-h-screen flex items-center justify-center overflow-x-hidden">
      
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 radial-glow pointer-events-none"></div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-[1280px] px-4 md:px-6 flex items-center justify-center min-h-screen">
        <LoginCard />

        {/* Decorative Elements - Desktop Only */}
        <div className="hidden lg:block absolute -right-24 top-1/4 w-64 h-64 border border-outline-variant rounded-full opacity-20 pointer-events-none"></div>
        <div className="hidden lg:block absolute -left-12 bottom-1/4 w-32 h-32 border border-outline-variant rounded-full opacity-20 pointer-events-none"></div>
      </main>

      {/* Visual Footer Decoration */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1280px] px-4 flex justify-between items-center opacity-40 pointer-events-none">
        <span className="text-label-md">v2.4.0 Precision Core</span>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full brand-gradient"></div>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
        </div>
      </div>
    </body>
  )
}