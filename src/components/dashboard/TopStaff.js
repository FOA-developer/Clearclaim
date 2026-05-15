'use client'

const staff = [
  { name: 'Chioma Eze', role: 'Product Lead', hours: '168h', rate: '100%', initials: 'CE', color: 'bg-[#F3F0FF] text-primary' },
  { name: 'Tunde Adeyemi', role: 'Senior Engineer', hours: '164h', rate: '98%', initials: 'TA', color: 'bg-[#ECFDF5] text-[#059669]' },
  { name: 'Ngozi Obi', role: 'Finance Manager', hours: '162h', rate: '97%', initials: 'NO', color: 'bg-[#FFF7ED] text-[#D97706]' },
  { name: 'Emeka Nwosu', role: 'HR Coordinator', hours: '160h', rate: '96%', initials: 'EN', color: 'bg-[#EFF6FF] text-[#2563EB]' },
  { name: 'Aisha Bello', role: 'Operations Analyst', hours: '158h', rate: '95%', initials: 'AB', color: 'bg-[#FDF2F8] text-[#DB2777]' },
]

export default function TopStaff() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Top Staff</h3>
          <p className="text-[13px] text-[#6B7280]">By attendance this month</p>
        </div>
      </div>

      <div className="space-y-3">
        {staff.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#9CA3AF] w-4">{i + 1}</span>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${s.color}`}>
              {s.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#111827] truncate">{s.name}</p>
              <p className="text-[12px] text-[#9CA3AF]">{s.role}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-semibold text-[#111827]">{s.hours}</p>
              <p className="text-[12px] text-[#059669]">{s.rate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
