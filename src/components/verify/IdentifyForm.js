'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function IdentityForm() {
  const router = useRouter()
  const [faceFile, setFaceFile] = useState(null)
  const [idFile, setIdFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push('/verify/identity/scanning')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Face Photo Upload */}
        <div
          className="p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors min-h-[200px] rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23C2185B' stroke-width='2' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c%2fsvg%3e")`
          }}
          onClick={() => document.getElementById('face-upload').click()}
        >
          <span className="material-symbols-outlined text-4xl brand-gradient-text mb-2">
            face
          </span>
          <p className="text-headline-sm font-semibold">
            {faceFile ? faceFile.name : 'Face Photo'}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Drag & Drop or click to upload
          </p>
          <input
            id="face-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFaceFile(e.target.files[0])}
          />
        </div>

        {/* ID Document Upload */}
        <div
          className="p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors min-h-[200px] rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23C2185B' stroke-width='2' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c%2fsvg%3e")`
          }}
          onClick={() => document.getElementById('id-upload').click()}
        >
          <span className="material-symbols-outlined text-4xl brand-gradient-text mb-2">
            cloud_upload
          </span>
          <p className="text-headline-sm font-semibold">
            {idFile ? idFile.name : 'ID Document'}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Drag & Drop or click to upload
          </p>
          <input
            id="id-upload"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setIdFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-label-md text-on-surface-variant ml-1 block">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            required
            className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface py-3 px-4 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-label-md text-on-surface-variant ml-1 block">
            Country
          </label>
          <select
            required
            className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface py-3 px-4 outline-none"
          >
            <option value="">Select country</option>
            <option>Nigeria</option>
            <option>Ghana</option>
            <option>Kenya</option>
            <option>South Africa</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-label-md text-on-surface-variant ml-1 block">
            Date of Birth
          </label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface py-3 px-4 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full brand-gradient text-white py-4 rounded-xl text-headline-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg hover:-translate-y-1"
      >
        Submit Claim
        <span className="material-symbols-outlined">send</span>
      </button>
    </form>
  )
}