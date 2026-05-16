'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineUserPlus,
} from 'react-icons/hi2'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function generateAttendance(year, month, seed) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const records = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = date.getDay()
    if (dow === 0 || dow === 6) {
      records.push({ day: d, status: 'weekend', checkIn: null, checkOut: null })
      continue
    }
    const today = new Date()
    if (date > today) {
      records.push({ day: d, status: 'upcoming', checkIn: null, checkOut: null })
      continue
    }
    const rand = ((seed * 31 + d * 7) % 100)
    if (rand < 70) {
      records.push({ day: d, status: 'present', checkIn: '08:55 AM', checkOut: '05:02 PM' })
    } else if (rand < 85) {
      records.push({ day: d, status: 'late', checkIn: '09:45 AM', checkOut: '05:30 PM' })
    } else if (rand < 95) {
      records.push({ day: d, status: 'absent', checkIn: null, checkOut: null })
    } else {
      records.push({ day: d, status: 'leave', checkIn: null, checkOut: null })
    }
  }
  return records
}

const DEPARTMENTS = ['Engineering', 'Product', 'Finance', 'Human Resources', 'Operations', 'Support', 'Marketing', 'Sales']
const ROLES = [
  ['staff', 'Staff'],
  ['manager', 'Manager'],
  ['admin', 'Admin'],
]

const staffStatusConfig = {
  active: { label: 'Active', cls: 'text-[#059669] bg-[#ECFDF5]' },
  invited: { label: 'Invited', cls: 'text-[#2563EB] bg-[#EFF6FF]' },
  on_leave: { label: 'On Leave', cls: 'text-[#D97706] bg-[#FFF7ED]' },
  suspended: { label: 'Suspended', cls: 'text-[#D97706] bg-[#FFF7ED]' },
  terminated: { label: 'Terminated', cls: 'text-[#DC2626] bg-[#FEF2F2]' },
}

const nameColors = [
  'bg-[#F3F0FF] text-primary',
  'bg-[#ECFDF5] text-[#059669]',
  'bg-[#FFF7ED] text-[#D97706]',
  'bg-[#EFF6FF] text-[#2563EB]',
  'bg-[#FDF2F8] text-[#DB2777]',
  'bg-[#F0FDF4] text-[#16A34A]',
  'bg-[#FEF3C7] text-[#B45309]',
  'bg-[#FCE7F3] text-[#BE185D]',
  'bg-[#E0E7FF] text-[#4338CA]',
  'bg-[#FEF2F2] text-[#DC2626]',
]

export default function StaffView() {
  const [staffList, setStaffList] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [selectedStaff, setSelectedStaff] = useState(null)

  // Add Staff modal
  const [addOpen, setAddOpen] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState('staff')
  const [addDepartment, setAddDepartment] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [addSending, setAddSending] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const isAdmin = currentUser?.role === 'admin'

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/staff', { credentials: 'include' })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 403) {
          setError('You do not have permission to view staff')
          setCurrentUser({ role: 'staff' })
          return
        }
        throw new Error(json?.error?.message ?? 'Failed to load staff')
      }
      setCurrentUser(json.currentUser ?? { role: 'staff' })
      setStaffList(json.staff ?? [])
    } catch (e) {
      setError(e.message ?? 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const departments = useMemo(() => {
    const depts = ['All', ...new Set(staffList.map((s) => s.department).filter(Boolean))]
    // Deduplicate in case 'All' appears from the data
    return [...new Set(depts)]
  }, [staffList])

  const filtered = staffList.filter((s) => {
    const matchDept = department === 'All' || s.department === department
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  async function updateStaffStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Update failed')

      setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))
      setSelectedStaff((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev))
    } catch (e) {
      alert(e.message ?? 'Failed to update staff')
    }
  }

  async function handleAddStaff(e) {
    e.preventDefault()
    if (!addEmail || !addEmail.includes('@')) {
      setAddError('Please enter a valid email')
      return
    }
    setAddSending(true)
    setAddError('')
    setAddSuccess('')
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: addEmail.trim(),
          role: addRole,
          department: addDepartment,
          phone: addPhone,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to invite')

      setAddSuccess(json.message ?? 'Invitation sent')
      setAddEmail('')
      setAddRole('staff')
      setAddDepartment('')
      setAddPhone('')

      // Refresh the list after a short delay to show the new invited user
      setTimeout(() => {
        fetchStaff()
        setAddSuccess('')
      }, 1500)
    } catch (e) {
      setAddError(e.message ?? 'Failed to send invitation')
    } finally {
      setAddSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">Staff Directory</h2>
          <p className="text-[13px] text-[#6B7280]">
            {loading ? 'Loading…' : `${staffList.length} team member${staffList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg w-full sm:w-[220px]">
            <HiOutlineMagnifyingGlass size={16} className="text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full"
            />
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAddError('')
                setAddSuccess('')
                setAddOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <HiOutlineUserPlus size={18} />
              Add Staff
            </button>
          )}
        </div>
      </div>

      {/* Department filter */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 overflow-x-auto">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDepartment(d)}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
              department === d ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-start gap-4">
                <Skeleton circle width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={13} />
                  <div className="flex gap-2">
                    <Skeleton width={80} height={22} borderRadius={4} />
                    <Skeleton width={60} height={22} borderRadius={4} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-3">
            <HiOutlineExclamationTriangle size={24} className="text-[#DC2626]" />
          </div>
          <p className="text-[14px] text-[#DC2626] font-medium">{error}</p>
        </div>
      )}

      {/* Staff grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((staff, idx) => {
            const stCfg = staffStatusConfig[staff.status] || staffStatusConfig.active
            return (
              <button
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="bg-white rounded-xl border border-[#E5E7EB] p-5 text-left hover:shadow-md hover:border-[#D1D5DB] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${nameColors[idx % nameColors.length]}`}
                  >
                    {staff.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#111827] truncate group-hover:text-primary transition-colors">
                      {staff.name}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">{staff.role === 'admin' ? 'Admin' : staff.role === 'manager' ? 'Manager' : staff.role}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">
                        {staff.department || '—'}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${stCfg.cls}`}>
                        {stCfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
            <HiOutlineUserPlus size={24} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[14px] text-[#9CA3AF]">
            {search || department !== 'All'
              ? 'No staff members match your search'
              : 'No staff members yet'}
          </p>
          {isAdmin && !search && department === 'All' && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-3 px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <HiOutlineUserPlus size={16} />
              Add your first staff
            </button>
          )}
        </div>
      )}

      {/* Staff detail drawer */}
      {selectedStaff && (
        <StaffDetailDrawer
          staff={selectedStaff}
          isAdmin={isAdmin}
          currentUserId={currentUser?.id}
          onClose={() => setSelectedStaff(null)}
          onUpdateStatus={updateStaffStatus}
        />
      )}

      {/* ── Add Staff Modal ─────────────────────────────── */}
      {addOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            role="dialog"
            className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[15px] font-semibold text-[#111827] flex items-center gap-2">
                <HiOutlineUserPlus size={20} className="text-primary" />
                Add Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
                disabled={addSending}
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="px-5 py-4 space-y-4">
              {addSuccess && (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg px-3 py-2.5 text-[13px] text-[#059669] font-medium">
                  {addSuccess}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@company.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  An invitation email will be sent via Supabase Auth.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Role
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {ROLES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Department
                </label>
                <select
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Phone <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {addError && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2.5 text-[13px] text-[#DC2626]">
                  {addError}
                </div>
              )}

              <button
                type="submit"
                disabled={addSending}
                className="w-full py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {addSending ? 'Sending invitation…' : 'Send Invitation'}
              </button>
              <p className="text-[11px] text-[#9CA3AF] text-center">
                The recipient will receive a magic link to set up their account.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Staff Detail Drawer ─────────────────────────────────────────── */

function StaffDetailDrawer({ staff, isAdmin, currentUserId, onClose, onUpdateStatus }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [confirmAction, setConfirmAction] = useState(null)
  const [updating, setUpdating] = useState(false)

  const stCfg = staffStatusConfig[staff.status] || staffStatusConfig.active

  const attendance = useMemo(
    () => generateAttendance(viewYear, viewMonth, staff.id?.length || 8),
    [viewYear, viewMonth, staff.id],
  )

  const stats = useMemo(() => {
    const working = attendance.filter((d) => !['weekend', 'upcoming'].includes(d.status))
    const present = working.filter((d) => d.status === 'present').length
    const late = working.filter((d) => d.status === 'late').length
    const absent = working.filter((d) => d.status === 'absent').length
    const total = working.length || 1
    return { present, late, absent, rate: Math.round(((present + late) / total) * 100) }
  }, [attendance])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else setViewMonth(viewMonth - 1)
  }

  function nextMonth() {
    if (viewMonth === now.getMonth() && viewYear === now.getFullYear()) return
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else setViewMonth(viewMonth + 1)
  }

  async function handleConfirm() {
    if (!confirmAction) return
    setUpdating(true)
    try {
      await onUpdateStatus(staff.id, confirmAction.newStatus)
    } finally {
      setUpdating(false)
      setConfirmAction(null)
    }
  }

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()
  const isSelf = staff.id === currentUserId
  const colorIdx = staff.id?.length || 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold ${nameColors[colorIdx % nameColors.length]}`}
            >
              {staff.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#111827]">{staff.name}</h3>
              <p className="text-[13px] text-[#6B7280]">
                {staff.role === 'admin' ? 'Admin' : staff.role === 'manager' ? 'Manager' : staff.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <HiOutlineXMark size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Profile</h4>
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <ProfileRow icon={HiOutlineEnvelope} label="Email" value={staff.email} />
              <ProfileRow icon={HiOutlinePhone} label="Phone" value={staff.phone || '—'} />
              <ProfileRow
                icon={HiOutlineBuildingOffice2}
                label="Department"
                value={staff.department || '—'}
              />
              <ProfileRow
                icon={HiOutlineCalendarDays}
                label="Joined"
                value={staff.joined ? new Date(staff.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-[#6B7280]">Status</span>
                <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${stCfg.cls}`}>
                  {stCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">
                Attendance
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <HiOutlineChevronLeft size={16} className="text-[#6B7280]" />
                </button>
                <span className="text-[14px] font-medium text-[#111827] min-w-[140px] text-center">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={nextMonth}
                  disabled={isCurrentMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors disabled:opacity-30"
                >
                  <HiOutlineChevronRight size={16} className="text-[#6B7280]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <AttStat label="Present" value={stats.present} color="text-[#059669]" bg="bg-[#ECFDF5]" />
              <AttStat label="Late" value={stats.late} color="text-[#D97706]" bg="bg-[#FFF7ED]" />
              <AttStat label="Absent" value={stats.absent} color="text-[#DC2626]" bg="bg-[#FEF2F2]" />
              <AttStat label="Rate" value={`${stats.rate}%`} color="text-primary" bg="bg-[#F3F0FF]" />
            </div>

            {/* Calendar */}
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[11px] font-medium text-[#9CA3AF] uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                {attendance.map((day) => (
                  <div key={day.day} className="p-1.5">
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-[12px] font-medium ${dayStyle(day.status)}`}
                      title={`${day.day} — ${day.status}${day.checkIn ? ` (${day.checkIn} - ${day.checkOut})` : ''}`}
                    >
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <Legend color="bg-[#059669]" label="Present" />
              <Legend color="bg-[#FBBF24]" label="Late" />
              <Legend color="bg-[#F87171]" label="Absent" />
              <Legend color="bg-[#93C5FD]" label="Leave" />
              <Legend color="bg-[#E5E7EB]" label="Weekend" />
            </div>
          </div>

          {/* Daily log */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider mb-3">
              Daily Log
            </h4>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
              {attendance
                .filter((d) => !['weekend', 'upcoming'].includes(d.status))
                .reverse()
                .map((day) => {
                  const cfg = dayLogConfig[day.status]
                  const Icon = cfg?.icon || HiOutlineMinusCircle
                  return (
                    <div
                      key={day.day}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#F3F4F6] transition-colors"
                    >
                      <Icon size={16} className={cfg?.color || 'text-[#9CA3AF]'} />
                      <span className="text-[13px] font-medium text-[#111827] w-6">{day.day}</span>
                      <span
                        className={`text-[12px] font-medium px-2 py-0.5 rounded ${cfg?.cls || 'bg-[#F3F4F6] text-[#9CA3AF]'}`}
                      >
                        {cfg?.label || day.status}
                      </span>
                      <span className="text-[12px] text-[#9CA3AF] ml-auto">
                        {day.checkIn ? `${day.checkIn} → ${day.checkOut}` : '—'}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Actions — admin only */}
          {isAdmin && !isSelf && (
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">Actions</h4>

              {staff.status === 'active' && (
                <div className="space-y-2">
                  <ActionBtn
                    icon={HiOutlineNoSymbol}
                    iconColor="text-[#D97706]"
                    borderColor="border-[#FED7AA]"
                    hoverBg="hover:bg-[#FFF7ED]"
                    title="Suspend staff"
                    subtitle="Temporarily revoke access"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'suspended',
                        title: 'Suspend Staff',
                        description: `Are you sure you want to suspend ${staff.name}? They will lose access to all systems until reactivated.`,
                        buttonLabel: 'Suspend',
                        buttonCls: 'bg-[#D97706] hover:bg-[#B45309]',
                      })
                    }
                  />
                  <ActionBtn
                    icon={HiOutlineExclamationTriangle}
                    iconColor="text-[#DC2626]"
                    borderColor="border-[#FECACA]"
                    hoverBg="hover:bg-[#FEF2F2]"
                    title="Terminate staff"
                    subtitle="Permanently remove from company"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'terminated',
                        title: 'Terminate Staff',
                        description: `Are you sure you want to terminate ${staff.name}? This action will permanently remove their access and cannot be undone easily.`,
                        buttonLabel: 'Terminate',
                        buttonCls: 'bg-[#DC2626] hover:bg-[#B91C1C]',
                      })
                    }
                  />
                </div>
              )}

              {staff.status === 'suspended' && (
                <div className="space-y-2">
                  <ActionBtn
                    icon={HiOutlineArrowPath}
                    iconColor="text-[#059669]"
                    borderColor="border-[#A7F3D0]"
                    hoverBg="hover:bg-[#ECFDF5]"
                    title="Reactivate staff"
                    subtitle="Restore access to all systems"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'active',
                        title: 'Reactivate Staff',
                        description: `Reactivate ${staff.name}? They will regain access to all systems.`,
                        buttonLabel: 'Reactivate',
                        buttonCls: 'bg-[#059669] hover:bg-[#047857]',
                      })
                    }
                  />
                  <ActionBtn
                    icon={HiOutlineExclamationTriangle}
                    iconColor="text-[#DC2626]"
                    borderColor="border-[#FECACA]"
                    hoverBg="hover:bg-[#FEF2F2]"
                    title="Terminate staff"
                    subtitle="Permanently remove from company"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'terminated',
                        title: 'Terminate Staff',
                        description: `Are you sure you want to terminate ${staff.name}? This action will permanently remove their access.`,
                        buttonLabel: 'Terminate',
                        buttonCls: 'bg-[#DC2626] hover:bg-[#B91C1C]',
                      })
                    }
                  />
                </div>
              )}

              {staff.status === 'on_leave' && (
                <div className="space-y-2">
                  <ActionBtn
                    icon={HiOutlineNoSymbol}
                    iconColor="text-[#D97706]"
                    borderColor="border-[#FED7AA]"
                    hoverBg="hover:bg-[#FFF7ED]"
                    title="Suspend staff"
                    subtitle="Temporarily revoke access"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'suspended',
                        title: 'Suspend Staff',
                        description: `Are you sure you want to suspend ${staff.name}?`,
                        buttonLabel: 'Suspend',
                        buttonCls: 'bg-[#D97706] hover:bg-[#B45309]',
                      })
                    }
                  />
                  <ActionBtn
                    icon={HiOutlineExclamationTriangle}
                    iconColor="text-[#DC2626]"
                    borderColor="border-[#FECACA]"
                    hoverBg="hover:bg-[#FEF2F2]"
                    title="Terminate staff"
                    subtitle="Permanently remove from company"
                    disabled={updating}
                    onClick={() =>
                      setConfirmAction({
                        newStatus: 'terminated',
                        title: 'Terminate Staff',
                        description: `Are you sure you want to terminate ${staff.name}?`,
                        buttonLabel: 'Terminate',
                        buttonCls: 'bg-[#DC2626] hover:bg-[#B91C1C]',
                      })
                    }
                  />
                </div>
              )}

              {staff.status === 'terminated' && (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                  <p className="text-[13px] text-[#991B1B]">
                    This staff member has been terminated. No further actions available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          description={confirmAction.description}
          buttonLabel={confirmAction.buttonLabel}
          buttonCls={confirmAction.buttonCls}
          disabled={updating}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

/* ── Confirmation Modal ──────────────────────────────────────────── */

function ConfirmModal({
  title,
  description,
  buttonLabel,
  buttonCls,
  disabled,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationTriangle size={24} className="text-[#DC2626]" />
        </div>
        <h3 className="text-[17px] font-semibold text-[#111827] text-center mb-2">{title}</h3>
        <p className="text-[14px] text-[#6B7280] text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 py-2.5 border border-[#D1D5DB] text-[14px] font-medium text-[#374151] rounded-xl hover:bg-[#F9FAFB] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`flex-1 py-2.5 text-white text-[14px] font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 ${buttonCls}`}
          >
            {disabled ? 'Updating…' : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────── */

const dayLogConfig = {
  present: { label: 'Present', icon: HiOutlineCheckCircle, color: 'text-[#059669]', cls: 'bg-[#ECFDF5] text-[#059669]' },
  late: { label: 'Late', icon: HiOutlineClock, color: 'text-[#D97706]', cls: 'bg-[#FFF7ED] text-[#D97706]' },
  absent: { label: 'Absent', icon: HiOutlineXCircle, color: 'text-[#DC2626]', cls: 'bg-[#FEF2F2] text-[#DC2626]' },
  leave: { label: 'Leave', icon: HiOutlineCalendarDays, color: 'text-[#2563EB]', cls: 'bg-[#EFF6FF] text-[#2563EB]' },
}

function dayStyle(status) {
  switch (status) {
    case 'present':
      return 'bg-[#059669] text-white'
    case 'late':
      return 'bg-[#FBBF24] text-white'
    case 'absent':
      return 'bg-[#F87171] text-white'
    case 'leave':
      return 'bg-[#93C5FD] text-white'
    case 'weekend':
      return 'bg-[#F3F4F6] text-[#9CA3AF]'
    case 'upcoming':
      return 'bg-white text-[#D1D5DB] border border-[#E5E7EB]'
    default:
      return 'bg-white text-[#9CA3AF]'
  }
}

function ActionBtn({ icon: Icon, iconColor, borderColor, hoverBg, title, subtitle, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 border ${borderColor} rounded-xl text-left ${hoverBg} transition-colors disabled:opacity-40`}
    >
      <Icon size={20} className={iconColor} />
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{title}</p>
        <p className="text-[12px] text-[#6B7280]">{subtitle}</p>
      </div>
    </button>
  )
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-[#9CA3AF] shrink-0" />
      <span className="text-[13px] text-[#6B7280] w-24">{label}</span>
      <span className="text-[14px] font-medium text-[#111827] truncate">{value}</span>
    </div>
  )
}

function AttStat({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <p className={`text-[18px] font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-[#6B7280] mt-0.5">{label}</p>
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
