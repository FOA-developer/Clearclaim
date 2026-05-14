export default function SquadIntegration() {
  return (
    <section className="py-24 px-4 bg-surface-container-low" id="integration">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 mb-6 text-label-md text-primary">
            <span className="w-2 h-2 rounded-full brand-gradient"></span>
            POWERED BY SQUAD
          </div>
          <h2 className="text-headline-lg font-bold mb-6">Real-time Enforcement</h2>
          <p className="text-body-lg mb-8 leading-relaxed text-on-surface-variant">
            ClearClaim doesn't just flag fraud; it enforces the verdict through our deep integration with Squad's transactional layer.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-surface border-outline-variant">
              <span className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">PASS</span>
              <span className="text-body-md text-on-surface-variant">Instant release of funds to validated recipient.</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-surface border-outline-variant">
              <span className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">FAIL</span>
              <span className="text-body-md text-on-surface-variant">Hard block on all outbound transfers.</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-surface border-outline-variant">
              <span className="w-12 h-10 px-2 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-[10px]">REVIEW</span>
              <span className="text-body-md text-on-surface-variant">Automatic hold in multi-sig escrow for manual check.</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <pre className="font-mono text-sm leading-relaxed text-blue-300 overflow-x-auto">{`{
  "event": "squad.claim_processed",
  "payload": {
    "claim_id": "CC_99812_TX",
    "status": "PASS",
    "verification_score": 0.994,
    "enforcement_action": "RELEASE_FUNDS",
    "metadata": {
      "biometric_hash": "a98...f22",
      "timestamp": "2023-11-20T10:44:01Z"
    }
  },
  "signature": "hmac_sha256_v1..."
}`}</pre>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-slate-500 text-label-md">
              <span className="material-symbols-outlined text-sm">code</span> squad-webhook.json
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}