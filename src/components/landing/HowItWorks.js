export default function HowItWorks() {
  return (
    <section className="bg-surface-container-low py-24 px-4" id="how-it-works">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg font-bold mb-4">How It Works</h2>
          <div className="h-1 w-20 brand-gradient mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="flex-1 group text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-outline-variant group-hover:border-primary transition-colors mx-auto">
              <span className="material-symbols-outlined text-3xl brand-gradient-text">upload_file</span>
            </div>
            <h3 className="text-headline-sm font-semibold mb-3">Submit a Claim</h3>
            <p className="text-body-md text-on-surface-variant">
              Initiate a verification request via our API or Dashboard. ClearClaim ingests documentation and metadata securely.
            </p>
          </div>

          <div className="hidden md:block pt-8 opacity-20">
            <span className="material-symbols-outlined text-4xl">arrow_forward</span>
          </div>

          <div className="flex-1 group text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-outline-variant group-hover:border-primary transition-colors mx-auto">
              <span className="material-symbols-outlined text-3xl brand-gradient-text">psychology</span>
            </div>
            <h3 className="text-headline-sm font-semibold mb-3">AI Runs Verification</h3>
            <p className="text-body-md text-on-surface-variant">
              Our proprietary neural networks cross-reference data against global ledgers to detect synthetic identities and document tampering.
            </p>
          </div>

          <div className="hidden md:block pt-8 opacity-20">
            <span className="material-symbols-outlined text-4xl">arrow_forward</span>
          </div>

          <div className="flex-1 group text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-outline-variant group-hover:border-primary transition-colors mx-auto">
              <span className="material-symbols-outlined text-3xl brand-gradient-text">shield_with_heart</span>
            </div>
            <h3 className="text-headline-sm font-semibold mb-3">Squad Enforces Verdict</h3>
            <p className="text-body-md text-on-surface-variant">
              Automated enforcement through Squad logic. Funds are released, blocked, or held in escrow based on verified outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}