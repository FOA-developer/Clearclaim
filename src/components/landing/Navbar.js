'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">verified</span>
        <span className="text-headline-md font-bold bg-gradient-to-r from-[#7B1FA2] via-[#C2185B] to-[#F4511E] bg-clip-text text-transparent">
          ClearClaim
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          How it Works
        </a>
        <a href="#claim-types" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          Claim Types
        </a>
        <a href="#integration" className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          Squad Integration
        </a>
        <Link href="/login">
          <button className="brand-gradient text-white px-6 py-2 rounded-full text-label-md active:scale-95 transition-transform">
            Login
          </button>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden p-2 active:scale-95 transition-transform"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="material-symbols-outlined">
          {menuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-surface border-b border-outline-variant flex flex-col items-start gap-4 px-6 py-6 md:hidden">
          <a href="#how-it-works" className="text-on-surface-variant text-label-md hover:text-primary">How it Works</a>
          <a href="#claim-types" className="text-on-surface-variant text-label-md hover:text-primary">Claim Types</a>
          <a href="#integration" className="text-on-surface-variant text-label-md hover:text-primary">Squad Integration</a>
          <Link href="/login">
            <button className="brand-gradient text-white px-6 py-2 rounded-full text-label-md">
              Login
            </button>
          </Link>
        </div>
      )}
    </nav>
  )
}