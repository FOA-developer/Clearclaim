'use client'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const data = [
  { present: 42, absent: 3, late: 5 },
  { present: 44, absent: 2, late: 4 },
  { present: 40, absent: 5, late: 5 },
  { present: 46, absent: 1, late: 3 },
  { present: 43, absent: 4, late: 3 },
]

const maxVal = 50

export default function AttendanceChart() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Staff Attendance</h3>
          <p className="text-[13px] text-[#6B7280]">This week&apos;s overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Legend color="bg-primary" label="Present" />
          <Legend color="bg-[#FBBF24]" label="Late" />
          <Legend color="bg-[#F87171]" label="Absent" />
        </div>
      </div>

      <div className="flex items-end gap-3 h-[180px]">
        {days.map((day, i) => {
          const { present, absent, late } = data[i]
          const pHeight = (present / maxVal) * 100
          const lHeight = (late / maxVal) * 100
          const aHeight = (absent / maxVal) * 100

          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-[2px]" style={{ height: '160px', justifyContent: 'flex-end' }}>
                <div className="w-full max-w-[32px] bg-[#F87171] rounded-t" style={{ height: `${aHeight}%` }} title={`Absent: ${absent}`} />
                <div className="w-full max-w-[32px] bg-[#FBBF24]" style={{ height: `${lHeight}%` }} title={`Late: ${late}`} />
                <div className="w-full max-w-[32px] bg-primary rounded-b" style={{ height: `${pHeight}%` }} title={`Present: ${present}`} />
              </div>
              <span className="text-[12px] text-[#6B7280] font-medium">{day}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center gap-6">
        <Stat label="Avg. Present" value="86%" color="text-primary" />
        <Stat label="Avg. Late" value="8%" color="text-[#D97706]" />
        <Stat label="Avg. Absent" value="6%" color="text-[#DC2626]" />
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-[12px] text-[#6B7280]">{label}</span>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className={`text-[18px] font-bold ${color}`}>{value}</p>
      <p className="text-[12px] text-[#9CA3AF]">{label}</p>
    </div>
  )
}
