'use client'

import { useState, useEffect } from 'react'
import {
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineBell,
  HiOutlinePaintBrush,
  HiOutlineShieldCheck,
  HiOutlineGlobeAlt,
  HiOutlineCheckCircle,
  HiOutlineCamera,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from 'react-icons/hi2'

const TABS = [
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
  { id: 'company', label: 'Company', icon: HiOutlineBuildingOffice2 },
  { id: 'appearance', label: 'Appearance', icon: HiOutlinePaintBrush },
  { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
]

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="max-w-[1000px] space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-[#111827]">Settings</h2>
        <p className="text-[13px] text-[#6B7280]">Manage your account, preferences, and security</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === id ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'company' && <CompanySettings />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  )
}

/* ── Profile Settings ────────────────────────────────────────────── */

function ProfileSettings() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    fullName: 'Adebayo Ogunlesi',
    email: 'adebayo@clearclaim.ng',
    phone: '+234 801 234 5678',
    role: 'CEO',
  })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="p-6 space-y-6">
      <SectionHeader title="Personal Information" subtitle="Update your profile details" />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[20px] font-bold text-primary">
          AO
        </div>
        <div>
          <button type="button" className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] text-[13px] font-medium text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors">
            <HiOutlineCamera size={16} />
            Change photo
          </button>
          <p className="text-[12px] text-[#9CA3AF] mt-1">JPG, PNG. Max 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsField icon={HiOutlineUser} label="Full name" value={form.fullName} onChange={(v) => update('fullName', v)} />
        <SettingsField icon={HiOutlineEnvelope} label="Email address" value={form.email} onChange={(v) => update('email', v)} type="email" />
        <SettingsField icon={HiOutlinePhone} label="Phone number" value={form.phone} onChange={(v) => update('phone', v)} />
        <SettingsField icon={HiOutlineBuildingOffice2} label="Role" value={form.role} onChange={(v) => update('role', v)} disabled />
      </div>

      <SaveBar saved={saved} />
    </form>
  )
}

/* ── Company Settings ────────────────────────────────────────────── */

function CompanySettings() {
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    size: '',
    revenue: '',
    cacNumber: '',
    tin: '',
    vatNumber: '',
    addressStreet: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    contactEmail: '',
    contactPhone: '',
    website: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const res = await fetch('/api/company', { credentials: 'include' })
        const json = await res.json().catch(() => null)
        if (!res.ok) throw new Error(json?.error?.message ?? 'Could not load company')
        const c = json.company
        if (!c || cancelled) return
        const addr = c.address ?? {}
        const contact = c.contact ?? {}
        const bank = c.bankDetails ?? {}
        setForm({
          companyName: c.companyName ?? '',
          industry: c.industry ?? '',
          size: c.size ?? '',
          revenue: c.revenue ?? '',
          cacNumber: c.cacNumber ?? '',
          tin: c.tin ?? '',
          vatNumber: c.vatNumber ?? '',
          addressStreet: addr.street ?? '',
          city: addr.city ?? '',
          state: addr.state ?? '',
          postalCode: addr.postalCode ?? '',
          country: addr.country ?? 'Nigeria',
          contactEmail: contact.email ?? '',
          contactPhone: contact.phone ?? '',
          website: contact.website ?? '',
          bankName: bank.bankName ?? '',
          bankAccountName: bank.accountName ?? '',
          bankAccountNumber: bank.accountNumber ?? '',
        })
      } catch (e) {
        if (!cancelled) setLoadError(e.message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setLoadError('')
    try {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.companyName.trim(),
          industry: form.industry.trim() || undefined,
          size: form.size.trim() || undefined,
          revenue: form.revenue.trim() || undefined,
          cacNumber: form.cacNumber.trim() || undefined,
          tin: form.tin.trim() || undefined,
          vatNumber: form.vatNumber.trim() || undefined,
          address: {
            street: form.addressStreet.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim() || 'Nigeria',
            postalCode: form.postalCode.trim(),
          },
          contact: {
            email: form.contactEmail.trim(),
            phone: form.contactPhone.trim(),
            website: form.website.trim(),
          },
          bankDetails: {
            bankName: form.bankName.trim(),
            accountName: form.bankAccountName.trim(),
            accountNumber: form.bankAccountNumber.trim(),
          },
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setLoadError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="p-6 space-y-6">
      <SectionHeader
        title="Company Information"
        subtitle="Used as seller details on invoices (CAC, TIN, bank, address)"
      />

      {loadError && (
        <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-lg">
          {loadError}
        </div>
      )}

      {loading ? (
        <p className="text-[14px] text-[#6B7280]">Loading company…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField
              icon={HiOutlineBuildingOffice2}
              label="Company name"
              value={form.companyName}
              onChange={(v) => update('companyName', v)}
            />
            <SettingsField
              icon={HiOutlineGlobeAlt}
              label="Industry"
              value={form.industry}
              onChange={(v) => update('industry', v)}
            />
            <SettingsField label="Company size" value={form.size} onChange={(v) => update('size', v)} />
            <SettingsField label="Revenue band" value={form.revenue} onChange={(v) => update('revenue', v)} />
            <SettingsField label="CAC number" value={form.cacNumber} onChange={(v) => update('cacNumber', v)} placeholder="RC1234567" />
            <SettingsField label="TIN" value={form.tin} onChange={(v) => update('tin', v)} placeholder="01234567-0001" />
            <SettingsField label="VAT number" value={form.vatNumber} onChange={(v) => update('vatNumber', v)} />
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#111827] mb-3">Registered address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsField label="Street" value={form.addressStreet} onChange={(v) => update('addressStreet', v)} />
              <SettingsField label="City" value={form.city} onChange={(v) => update('city', v)} />
              <SettingsField label="State" value={form.state} onChange={(v) => update('state', v)} />
              <SettingsField label="Postal code" value={form.postalCode} onChange={(v) => update('postalCode', v)} />
              <SettingsField label="Country" value={form.country} onChange={(v) => update('country', v)} />
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#111827] mb-3">Contact & web</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsField
                icon={HiOutlineEnvelope}
                label="Billing email"
                value={form.contactEmail}
                onChange={(v) => update('contactEmail', v)}
                type="email"
              />
              <SettingsField
                icon={HiOutlinePhone}
                label="Phone"
                value={form.contactPhone}
                onChange={(v) => update('contactPhone', v)}
              />
              <SettingsField
                icon={HiOutlineGlobeAlt}
                label="Website"
                value={form.website}
                onChange={(v) => update('website', v)}
              />
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[#111827] mb-3">Bank details (invoice footer)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsField label="Bank name" value={form.bankName} onChange={(v) => update('bankName', v)} />
              <SettingsField label="Account name" value={form.bankAccountName} onChange={(v) => update('bankAccountName', v)} />
              <SettingsField label="Account number" value={form.bankAccountNumber} onChange={(v) => update('bankAccountNumber', v)} />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-[14px] hover:opacity-90 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save company'}
        </button>
      </div>
      <SaveBar saved={saved} />
    </form>
  )
}

/* ── Appearance Settings ─────────────────────────────────────────── */

const THEMES = [
  { id: 'light', label: 'Light', description: 'Clean and bright', bg: 'bg-white', border: 'border-[#E5E7EB]', preview: 'bg-[#F9FAFB]' },
  { id: 'dark', label: 'Dark', description: 'Easy on the eyes', bg: 'bg-[#1F2937]', border: 'border-[#374151]', preview: 'bg-[#111827]' },
  { id: 'system', label: 'System', description: 'Match your OS setting', bg: 'bg-gradient-to-r from-white to-[#1F2937]', border: 'border-[#E5E7EB]', preview: 'bg-gradient-to-r from-[#F9FAFB] to-[#111827]' },
]

const ACCENT_COLORS = [
  { id: 'purple', label: 'Purple', value: '#4f378a' },
  { id: 'blue', label: 'Blue', value: '#2563EB' },
  { id: 'green', label: 'Green', value: '#059669' },
  { id: 'orange', label: 'Orange', value: '#D97706' },
  { id: 'rose', label: 'Rose', value: '#E11D48' },
  { id: 'teal', label: 'Teal', value: '#0D9488' },
]

const FONT_SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'default', label: 'Default' },
  { id: 'large', label: 'Large' },
]

function AppearanceSettings() {
  const [theme, setTheme] = useState('light')
  const [accent, setAccent] = useState('purple')
  const [fontSize, setFontSize] = useState('default')
  const [compactMode, setCompactMode] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-8">
      <SectionHeader title="Appearance" subtitle="Customize how ClearClaim looks for you" />

      {/* Theme */}
      <div>
        <p className="text-[14px] font-medium text-[#111827] mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setSaved(false) }}
              className={`rounded-xl border-2 p-4 text-left transition-all ${theme === t.id ? 'border-primary ring-2 ring-primary/20' : `${t.border} hover:border-[#9CA3AF]`
                }`}
            >
              <div className={`w-full h-16 rounded-lg mb-3 ${t.preview}`} />
              <p className="text-[14px] font-semibold text-[#111827]">{t.label}</p>
              <p className="text-[12px] text-[#6B7280]">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <p className="text-[14px] font-medium text-[#111827] mb-3">Accent Color</p>
        <div className="flex items-center gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setAccent(c.id); setSaved(false) }}
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${accent === c.id ? 'ring-2 ring-offset-2 ring-[#111827] scale-110' : 'hover:scale-105'
                }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            >
              {accent === c.id && <HiOutlineCheckCircle size={18} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <p className="text-[14px] font-medium text-[#111827] mb-3">Font Size</p>
        <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 w-fit">
          {FONT_SIZES.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFontSize(f.id); setSaved(false) }}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${fontSize === f.id ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact mode */}
      <div className="flex items-center justify-between py-3 border-t border-[#F3F4F6]">
        <div>
          <p className="text-[14px] font-medium text-[#111827]">Compact mode</p>
          <p className="text-[13px] text-[#6B7280]">Reduce spacing and padding throughout the app</p>
        </div>
        <Toggle enabled={compactMode} onChange={(v) => { setCompactMode(v); setSaved(false) }} />
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  )
}

/* ── Notification Settings ───────────────────────────────────────── */

function NotificationSettings() {
  const [saved, setSaved] = useState(false)
  const [prefs, setPrefs] = useState({
    emailInvoice: true,
    emailPayment: true,
    emailStaff: false,
    pushInvoice: true,
    pushPayment: true,
    pushStaff: true,
    weeklyDigest: true,
    monthlyReport: true,
  })

  function toggle(key) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Notifications" subtitle="Choose what you want to be notified about" />

      <div>
        <p className="text-[14px] font-semibold text-[#111827] mb-3">Email Notifications</p>
        <div className="space-y-1">
          <NotifRow label="New invoice received" description="When a vendor submits a new invoice" enabled={prefs.emailInvoice} onChange={() => toggle('emailInvoice')} />
          <NotifRow label="Payment processed" description="When a payment is sent or received" enabled={prefs.emailPayment} onChange={() => toggle('emailPayment')} />
          <NotifRow label="Staff updates" description="New hires, terminations, suspensions" enabled={prefs.emailStaff} onChange={() => toggle('emailStaff')} />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-semibold text-[#111827] mb-3">Push Notifications</p>
        <div className="space-y-1">
          <NotifRow label="Invoice alerts" description="Real-time invoice submission alerts" enabled={prefs.pushInvoice} onChange={() => toggle('pushInvoice')} />
          <NotifRow label="Payment alerts" description="Instant payment confirmations" enabled={prefs.pushPayment} onChange={() => toggle('pushPayment')} />
          <NotifRow label="Staff attendance" description="Daily attendance summaries" enabled={prefs.pushStaff} onChange={() => toggle('pushStaff')} />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-semibold text-[#111827] mb-3">Reports</p>
        <div className="space-y-1">
          <NotifRow label="Weekly digest" description="Summary of the week's activity every Monday" enabled={prefs.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
          <NotifRow label="Monthly report" description="Full financial report on the 1st of each month" enabled={prefs.monthlyReport} onChange={() => toggle('monthlyReport')} />
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  )
}

/* ── Security Settings ───────────────────────────────────────────── */

function SecuritySettings() {
  const [saved, setSaved] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })

  function updatePass(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  function handlePasswordChange(e) {
    e.preventDefault()
    setSaved(true)
    setPasswordForm({ current: '', newPass: '', confirm: '' })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Security" subtitle="Manage your account security and sessions" />

      {/* Change password */}
      <div>
        <p className="text-[14px] font-semibold text-[#111827] mb-3">Change Password</p>
        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
          <SettingsField icon={HiOutlineLockClosed} label="Current password" value={passwordForm.current} onChange={(v) => updatePass('current', v)} type="password" placeholder="Enter current password" />
          <SettingsField icon={HiOutlineLockClosed} label="New password" value={passwordForm.newPass} onChange={(v) => updatePass('newPass', v)} type="password" placeholder="Min 8 characters" />
          <SettingsField icon={HiOutlineLockClosed} label="Confirm new password" value={passwordForm.confirm} onChange={(v) => updatePass('confirm', v)} type="password" placeholder="Re-enter new password" />
          <button
            type="submit"
            disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm}
            className="px-5 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Two-factor */}
      <div className="flex items-center justify-between py-4 border-t border-[#F3F4F6]">
        <div>
          <p className="text-[14px] font-medium text-[#111827]">Two-factor authentication</p>
          <p className="text-[13px] text-[#6B7280]">Add an extra layer of security to your account</p>
        </div>
        <Toggle enabled={twoFactor} onChange={setTwoFactor} />
      </div>

      {/* Session timeout */}
      <div className="py-4 border-t border-[#F3F4F6]">
        <p className="text-[14px] font-medium text-[#111827] mb-2">Session Timeout</p>
        <p className="text-[13px] text-[#6B7280] mb-3">Automatically log out after inactivity</p>
        <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 w-fit">
          {['15', '30', '60', '120'].map((mins) => (
            <button
              key={mins}
              onClick={() => setSessionTimeout(mins)}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${sessionTimeout === mins ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Active sessions */}
      <div className="py-4 border-t border-[#F3F4F6]">
        <p className="text-[14px] font-medium text-[#111827] mb-3">Active Sessions</p>
        <div className="space-y-2">
          <SessionRow device="Chrome on Windows" location="Lagos, Nigeria" current />
          <SessionRow device="Safari on iPhone" location="Lagos, Nigeria" />
          <SessionRow device="Firefox on MacOS" location="Abuja, Nigeria" />
        </div>
        <button className="mt-3 text-[13px] text-[#DC2626] font-medium hover:underline">
          Sign out all other sessions
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl">
          <HiOutlineCheckCircle size={18} className="text-[#059669]" />
          <p className="text-[13px] text-[#065F46] font-medium">Password updated successfully</p>
        </div>
      )}
    </div>
  )
}

/* ── Shared Components ───────────────────────────────────────────── */

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
      <p className="text-[13px] text-[#6B7280]">{subtitle}</p>
    </div>
  )
}

function SettingsField({ icon: Icon, label, value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#111827] mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]`}
        />
      </div>
    </div>
  )
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-[#D1D5DB]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function NotifRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors">
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{label}</p>
        <p className="text-[12px] text-[#9CA3AF]">{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

function SessionRow({ device, location, current }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#111827]">{device}</p>
          {current && <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">Current</span>}
        </div>
        <p className="text-[12px] text-[#9CA3AF]">{location}</p>
      </div>
      {!current && (
        <button className="text-[12px] text-[#DC2626] font-medium hover:underline">Revoke</button>
      )}
    </div>
  )
}

function SaveBar({ saved, onSave }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
      {saved ? (
        <div className="flex items-center gap-2">
          <HiOutlineCheckCircle size={18} className="text-[#059669]" />
          <p className="text-[13px] text-[#059669] font-medium">Changes saved</p>
        </div>
      ) : (
        <div />
      )}
      <button
        type={onSave ? 'button' : 'submit'}
        onClick={onSave}
        className="px-6 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Save Changes
      </button>
    </div>
  )
}
