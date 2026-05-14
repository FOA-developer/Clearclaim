export default function Hero() {
  return (
    <section className="relative px-4 py-20 md:py-32 flex flex-col items-center text-center max-w-[1280px] mx-auto overflow-hidden">
      <div className="absolute -top-24 -z-10 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] brand-gradient rounded-full blur-[120px]"></div>
      </div>

      <h1 className="text-[28px] md:text-display-lg font-bold text-[#1A1A2E] mb-6 max-w-4xl leading-tight">
        Stop Fraud Before Money Moves
      </h1>

      <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl">
        The enterprise-grade verification layer for high-stakes transactions. ClearClaim identifies identity, credential, and payroll fraud in milliseconds.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-16">
        <button className="brand-gradient text-white px-10 py-4 rounded-xl text-headline-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-primary/20">
          Get Started
        </button>
        <button className="border-2 border-outline-variant hover:border-primary text-on-surface px-10 py-4 rounded-xl text-headline-sm font-semibold active:scale-95 transition-transform">
          See How It Works
        </button>
      </div>

      {/* Trust Score Ring */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            className="text-surface-container-high"
            cx="96" cy="96"
            fill="transparent"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
          />
          <circle
            cx="96" cy="96"
            fill="transparent"
            r="88"
            stroke="url(#gradient)"
            strokeDasharray="552"
            strokeDashoffset="110"
            strokeLinecap="round"
            strokeWidth="12"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7B1FA2" />
              <stop offset="50%" stopColor="#C2185B" />
              <stop offset="100%" stopColor="#F4511E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-headline-lg font-bold text-[#1A1A2E]">98.4</span>
          <span className="text-label-md text-on-surface-variant tracking-widest uppercase">Trust Score</span>
        </div>
      </div>
    </section>
  )
}