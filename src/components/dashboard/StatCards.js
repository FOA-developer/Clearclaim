export default function StatCards({ stats }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl relative overflow-hidden"
        >
          {/* Left gradient accent */}
          <div className="absolute top-0 left-0 w-1 h-full brand-gradient"></div>

          <p className="text-label-md text-on-surface-variant mb-2">
            {stat.label}
          </p>
          <h3 className="text-headline-lg font-bold">{stat.value}</h3>

          <div className={`flex items-center mt-2 ${stat.trendColor}`}>
            <span className="material-symbols-outlined text-[16px] mr-1">
              {stat.trendIcon}
            </span>
            <span className="text-body-sm font-bold">{stat.trend}</span>
          </div>
        </div>
      ))}
    </section>
  )
}