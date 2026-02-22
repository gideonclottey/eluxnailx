'use client'

import { useState } from 'react'
import { createService, updateService, toggleServiceActive } from '@/actions/services'

type Service = {
  id: number
  name: string
  durationMinutes: number
  priceCents: number
  isActive: boolean
}

const INPUT =
  'w-full p-2 text-sm border-2 border-[#e8c5d2] rounded-xl focus:outline-none focus:border-[#d4688e] transition-colors bg-white'

// ── Single service row ────────────────────────────────────────────────────────
function ServiceRow({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await updateService(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="bg-[#fdf0f4] rounded-xl border-2 border-[#d4688e] p-4 grid gap-3">
        <input type="hidden" name="id" value={service.id} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Service name</label>
            <input name="name" required defaultValue={service.name} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Duration (min)</label>
            <input name="durationMinutes" type="number" min="5" step="5" required defaultValue={service.durationMinutes} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Price ($)</label>
            <input name="price" type="number" min="0" step="0.01" required defaultValue={(service.priceCents / 100).toFixed(2)} className={INPUT} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white font-semibold rounded-xl transition-colors"
            style={{ backgroundColor: '#d4688e' }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setError(null) }}
            className="px-4 py-2 text-sm border-2 border-[#e8c5d2] rounded-xl text-[#2d2d2d] hover:border-[#d4688e] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-colors ${service.isActive ? 'border-[#e8c5d2] bg-white' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold ${service.isActive ? 'text-[#2d2d2d]' : 'text-gray-400 line-through'}`}>
            {service.name}
          </span>
          {!service.isActive && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">Inactive</span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-0.5">
          {service.durationMinutes} min &nbsp;·&nbsp; ${(service.priceCents / 100).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle active/inactive */}
        <form action={toggleServiceActive}>
          <input type="hidden" name="id" value={service.id} />
          <input type="hidden" name="isActive" value={String(!service.isActive)} />
          <button
            type="submit"
            className={`text-xs px-3 py-1.5 rounded-lg border-2 transition-colors ${
              service.isActive
                ? 'border-gray-200 text-gray-500 hover:bg-gray-100'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {service.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </form>

        {/* Edit */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs px-3 py-1.5 rounded-lg border-2 border-[#e8c5d2] text-[#2d2d2d] hover:border-[#d4688e] transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// ── Add service form ──────────────────────────────────────────────────────────
function AddServiceForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await createService(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 text-sm font-semibold border-2 border-dashed border-[#e8c5d2] rounded-xl text-[#d4688e] hover:border-[#d4688e] hover:bg-[#fdf0f4] transition-colors"
      >
        + Add New Service
      </button>
    )
  }

  return (
    <form onSubmit={handleCreate} className="bg-[#fdf0f4] rounded-xl border-2 border-[#d4688e] p-4 grid gap-3">
      <p className="text-sm font-semibold text-[#2d2d2d]">New Service</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Service name *</label>
          <input name="name" required placeholder="e.g. Gel Pedicure" className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Duration (min) *</label>
          <input name="durationMinutes" type="number" min="5" step="5" required placeholder="60" className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Price ($) *</label>
          <input name="price" type="number" min="0" step="0.01" required placeholder="45.00" className={INPUT} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white font-semibold rounded-xl transition-colors"
          style={{ backgroundColor: '#d4688e' }}
        >
          Add Service
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="px-4 py-2 text-sm border-2 border-[#e8c5d2] rounded-xl text-[#2d2d2d] hover:border-[#d4688e] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function ServicesManager({ services }: { services: Service[] }) {
  return (
    <div className="space-y-3">
      {services.map((s) => (
        <ServiceRow key={s.id} service={s} />
      ))}
      <AddServiceForm />
    </div>
  )
}
