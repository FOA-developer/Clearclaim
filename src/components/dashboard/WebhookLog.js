export default function WebhookLog({ logs }) {
  return (
    <section className="rounded-xl p-6 shadow-xl border border-white/10 font-mono text-sm leading-relaxed overflow-hidden" style={{ backgroundColor: '#0F0F1A' }}>

      {/* Terminal top bar */}
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-white/40 text-xs ml-4">
          admin@clearclaim: ~/logs/webhooks
        </span>
      </div>

      {/* Log lines */}
      <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
        {logs.map((log) => (
          <p key={log.id} className={`flex gap-4 ${log.color}`}>
            <span className="text-white/30 flex-shrink-0">[{log.timestamp}]</span>
            <span>{log.message}</span>
          </p>
        ))}

        {/* Blinking cursor */}
        <p className="text-white/40 animate-pulse">_</p>
      </div>
    </section>
  )
}