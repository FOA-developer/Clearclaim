const claims = [
  {
    icon: 'fingerprint',
    title: 'Identity Claim',
    items: ['Biometric Liveness Check', 'Government ID Validation', 'Anti-Spoofing Analysis']
  },
  {
    icon: 'school',
    title: 'Credential Claim',
    items: ['Institutional Verification', 'Tamper-Evident Logic', 'Global Accreditation DB']
  },
  {
    icon: 'account_balance',
    title: 'Payroll Claim',
    items: ['Employment Status Ping', 'Tax Liability Matching', 'Direct Deposit Auth']
  }
]

export default function ClaimTypes() {
  return (
    <section className="py-24 px-4" id="claim-types">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg font-bold mb-4">Verification Specialties</h2>
          <p className="text-body-md text-on-surface-variant">Tailored AI models for every high-risk category.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {claims.map((claim) => (
            <div
              key={claim.title}
              className="bg-surface border border-outline-variant rounded-xl p-8 relative overflow-hidden transition-all hover:-translate-y-2"
            >
              <div className="absolute top-0 left-0 w-full h-1 brand-gradient"></div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6 block">{claim.icon}</span>
              <h4 className="text-headline-md font-semibold mb-4">{claim.title}</h4>
              <ul className="space-y-3 text-body-sm text-on-surface-variant">
                {claim.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}