import LoginCard from '@/components/login/LoginCard'

export const metadata = {
  title: 'Login | ClearClaim',
}

export default function LoginPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center overflow-x-hidden">
      <div className="fixed inset-0 radial-glow pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[1280px] px-4 md:px-6 flex items-center justify-center min-h-screen">
        <LoginCard />
        <div className="hidden lg:block absolute -right-24 top-1/4 w-64 h-64 border border-outline-variant rounded-full opacity-20 pointer-events-none"></div>
        <div className="hidden lg:block absolute -left-12 bottom-1/4 w-32 h-32 border border-outline-variant rounded-full opacity-20 pointer-events-none"></div>
      </main>

    </div>
  )
}