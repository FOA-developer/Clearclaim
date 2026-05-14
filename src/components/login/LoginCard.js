'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    // auth logic goes here later
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 transition-all duration-300">
      
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <span className="text-headline-md font-bold brand-gradient-text">
            ClearClaim
          </span>
        </div>
        <h1 className="text-headline-sm font-semibold text-on-surface px-4">
          Verify Trust. Move Money with Confidence.
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Email Input */}
        <div className="space-y-2">
          <label
            className="text-label-md text-on-surface-variant block ml-1"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              mail
            </span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              id="email"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label
            className="text-label-md text-on-surface-variant block ml-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              lock
            </span>
            <input
              className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3.5 px-6 brand-gradient text-white text-headline-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          type="submit"
        >
          <span>Login</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        {/* Helper Links */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <Link
            href="#"
            className="text-body-sm text-primary hover:underline transition-all"
          >
            Forgot password?
          </Link>

          <div className="w-full flex items-center gap-4">
            <div className="h-px bg-outline-variant flex-grow"></div>
            <span className="text-label-md text-outline">OR</span>
            <div className="h-px bg-outline-variant flex-grow"></div>
          </div>

          <p className="text-body-sm text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="#" className="text-primary font-semibold hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}