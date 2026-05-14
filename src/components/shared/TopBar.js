import Link from 'next/link'

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface border-b border-outline-variant">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified
        </span>
        <span className="text-headline-md font-bold bg-gradient-to-r from-[#7B1FA2] via-[#C2185B] to-[#F4511E] bg-clip-text text-transparent">
          ClearClaim
        </span>
      </div>

      {/* Desktop Nav Links — hidden on mobile */}
      <div className="hidden md:flex fixed top-0 right-20 h-16 items-center gap-8 z-[60]">
        <Link href="/dashboard" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          DASHBOARD
        </Link>
        <Link href="/verify" className="text-primary text-label-md border-b-2 border-primary pt-1">
          VERIFY
        </Link>
        <Link href="/review" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          REVIEW
        </Link>
        <Link href="/claims" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          CLAIMS
        </Link>
        <Link href="/payments" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          PAYMENTS
        </Link>
      </div>

      {/* User Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-igRtE33SIzkmSJtMBGrb4KuhrgFpU4Y2DI9TIUUooNVHG04lAZWnbicZLs6VYmcmQi0AEkL8acRbwwO2zNpW1M4M-Mrm2Se4O8q8OJxLU_JiKU7ahKOgPW7SmwFK9VNLtNxiQI91ScCIopqY6ckwZ20alLwTmDkzWtobL6qtIpyAHk3j2E2RQ_4eG3fbtLSEiVKsDeurQaQsFjQdstxynxmPBwMBe59U-zYn-hmv1GvSacKx13qNcfxcgdoNPZxgyQG-Eiw-Q"
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  )
}