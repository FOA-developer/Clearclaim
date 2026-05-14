export default function VerificationFeed({ items }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex justify-between items-center">
        <h2 className="text-headline-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">stream</span>
          Live Verification Feed
        </h2>
        <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
      </div>

      {/* Feed items */}
      <div className="p-2 overflow-y-auto max-h-[400px] space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-body-md">{item.title}</p>
                <p className="text-body-sm text-on-surface-variant">{item.subtitle}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-label-md font-bold uppercase tracking-wider ${item.badgeStyle}`}>
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}