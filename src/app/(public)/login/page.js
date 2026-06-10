import Link from 'next/link'
import LoginCard from '@/components/login/LoginCard'

export const metadata = {
  title: 'Login | ClearClaim',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col bg-white">
        <nav className="h-16 px-6 md:px-10 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="#4f378a" />
              <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[18px] font-bold text-[#111827] tracking-tight">ClearClaim</span>
          </Link>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6 md:px-10 pb-12">
          <LoginCard />
        </main>
      </div>

      {/* Right — Testimonial */}
      <div className="hidden lg:flex w-[620px] xl:w-[700px] bg-[#F9FAFB] flex-col items-center justify-center px-12 border-l border-[#E5E7EB]">
        <div className="max-w-sm">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[18px] font-bold text-primary mb-8">
            AO
          </div>

          {/* Quote */}
          <blockquote className="text-[20px] md:text-[22px] font-medium text-[#111827] leading-snug mb-8">
            &ldquo;ClearClaim has been a{' '}
            <span className="bg-[#F3F0FF] text-primary px-1.5 py-0.5 rounded">game-changer</span>{' '}
            for us. We cut payroll processing from two days to twenty minutes. Our finance team finally has time for actual finance work.&rdquo;
          </blockquote>

          {/* Attribution */}
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">Amara Okonkwo</p>
            <p className="text-[14px] text-[#6B7280]">
              CFO at <span className="text-primary font-medium">Meridian Logistics</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
