'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const router = useRouter()

  function validate() {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errs.password = 'Must include uppercase, lowercase, and a number'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')

    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const signupData = await signupRes.json()

      if (!signupRes.ok) {
        if (signupData.error?.fields) setFieldErrors(signupData.error.fields)
        throw new Error(signupData.error?.message || 'Signup failed')
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!loginRes.ok) {
        throw new Error('Account created but auto-login failed. Please log in manually.')
      }

      router.push('/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] font-bold text-[#111827] tracking-tight mb-1">
        Create your account.
      </h1>
      <p className="text-[15px] text-[#6B7280] mb-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>

      {error && (
        <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2.5">
          <HiOutlineExclamationCircle size={18} className="text-[#DC2626] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#991B1B]">{error}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          id="email"
          label="Email address"
          Icon={HiOutlineEnvelope}
          type="email"
          placeholder="Enter email to get started"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />

        <InputField
          id="password"
          label="Password"
          Icon={HiOutlineLockClosed}
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 chars, upper + lower + number"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          trailing={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
          }
        />

        <InputField
          id="confirmPassword"
          label="Confirm password"
          Icon={HiOutlineLockClosed}
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          trailing={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              {showConfirm ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
          }
        />

        <button
          className="w-full py-3 px-6 bg-primary text-white text-[15px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </div>
  )
}

function InputField({ id, label, Icon, type, placeholder, value, onChange, error, trailing }) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#111827] mb-1.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 ${trailing ? 'pr-12' : 'pr-4'} py-3 bg-white border rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
              : 'border-[#D1D5DB] focus:ring-primary/20 focus:border-primary'
          }`}
        />
        {trailing}
      </div>
      {error && <p className="text-[13px] text-[#DC2626] mt-1.5">{error}</p>}
    </div>
  )
}
