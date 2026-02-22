'use client'

import { useState } from 'react'
import { createBooking } from '@/actions/booking'

type Service = { id: number; name: string; durationMinutes: number; priceCents: number }

const INPUT =
  'w-full p-3 border-2 rounded-xl focus:outline-none focus:border-[#d4688e] transition-colors text-[#2d2d2d] bg-white'
const INPUT_BORDER = 'border-[#e8c5d2]'

export function BookingForm({ services }: { services: Service[] }) {
  const [serviceId, setServiceId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[]>([]) // UTC ISO strings
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedService = services.find((s) => s.id === serviceId)

  async function fetchSlots(sid: number, d: string) {
    if (!sid || !d) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)
    try {
      const res = await fetch(`/api/slots?serviceId=${sid}&date=${d}`)
      const json = await res.json()
      setSlots(json.slots ?? [])
    } catch {
      setError('Failed to load available slots.')
    } finally {
      setLoadingSlots(false)
    }
  }

  function onServiceSelect(id: number) {
    setServiceId(id)
    setSelectedSlot(null)
    setSlots([])
    if (date) fetchSlots(id, date)
  }

  function onDateChange(d: string) {
    setDate(d)
    setSelectedSlot(null)
    setSlots([])
    if (serviceId) fetchSlots(serviceId, d)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!serviceId || !selectedSlot) {
      setError('Please select a service and a time slot.')
      return
    }
    setError(null)
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    fd.set('serviceId', String(serviceId))
    fd.set('slotUtc', selectedSlot)
    const result = await createBooking(fd)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  function reset() {
    setServiceId(null)
    setDate('')
    setSlots([])
    setSelectedSlot(null)
    setError(null)
    setSuccess(false)
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-5">💅</div>
        <h2 className="text-2xl font-bold text-[#2d2d2d] mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-500 mb-8">You'll receive details at your email. See you soon!</p>
        <button
          onClick={reset}
          className="px-8 py-3 text-white font-semibold rounded-xl transition-colors"
          style={{ backgroundColor: '#d4688e' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b54e74')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d4688e')}
        >
          Book Another Appointment
        </button>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Step 1 – Service */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#2d2d2d] mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: '#d4688e' }}
          >
            1
          </span>
          Choose a Service
        </h2>
        <div className="grid gap-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onServiceSelect(s.id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-[#d4688e] ${
                serviceId === s.id
                  ? 'border-[#d4688e] bg-[#fdf0f4]'
                  : 'border-[#e8c5d2] bg-white hover:border-[#d4688e]'
              }`}
            >
              <div>
                <p className="font-semibold text-[#2d2d2d]">{s.name}</p>
                <p className="text-sm text-gray-400">{s.durationMinutes} min</p>
              </div>
              <p className="font-bold" style={{ color: '#d4688e' }}>
                ${(s.priceCents / 100).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 – Date & Time */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#2d2d2d] mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: serviceId ? '#d4688e' : '#ccc' }}
          >
            2
          </span>
          Pick a Date &amp; Time
        </h2>

        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={!serviceId}
          className={`${INPUT} ${INPUT_BORDER} mb-4 disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        {loadingSlots && <p className="text-sm text-gray-400 animate-pulse">Loading available slots…</p>}

        {!loadingSlots && date && serviceId && slots.length === 0 && (
          <p className="text-sm text-gray-400">No available slots on this date. Please try another day.</p>
        )}

        {!loadingSlots && slots.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {slots.map((utc) => {
              const display = new Date(utc).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
              const selected = selectedSlot === utc
              return (
                <button
                  key={utc}
                  type="button"
                  onClick={() => setSelectedSlot(utc)}
                  className={`py-2 px-1 text-sm rounded-lg border-2 font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#d4688e] ${
                    selected
                      ? 'text-white border-[#d4688e]'
                      : 'text-[#2d2d2d] border-[#e8c5d2] bg-white hover:border-[#d4688e]'
                  }`}
                  style={selected ? { backgroundColor: '#d4688e' } : {}}
                >
                  {display}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Step 3 – Contact details (shown only after slot selected) */}
      {selectedSlot && (
        <section>
          <h2 className="text-base font-semibold text-[#2d2d2d] mb-3 flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: '#d4688e' }}
            >
              3
            </span>
            Your Details
          </h2>

          {/* Summary chip */}
          <div
            className="mb-5 p-3 rounded-xl text-sm text-white"
            style={{ backgroundColor: '#d4688e' }}
          >
            <strong>{selectedService?.name}</strong> ·{' '}
            {new Date(selectedSlot).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}{' '}
            at{' '}
            {new Date(selectedSlot).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              name="customerName"
              required
              placeholder="Full Name *"
              className={`${INPUT} ${INPUT_BORDER}`}
            />
            <input
              name="customerEmail"
              type="email"
              required
              placeholder="Email Address *"
              className={`${INPUT} ${INPUT_BORDER}`}
            />
            <input
              name="customerPhone"
              type="tel"
              placeholder="Phone Number (optional)"
              className={`${INPUT} ${INPUT_BORDER}`}
            />
            <textarea
              name="notes"
              rows={3}
              placeholder="Notes (optional) — e.g. nail shape, colour preference"
              className={`${INPUT} ${INPUT_BORDER} resize-none`}
            />

            {error && (
              <p className="text-sm font-medium" style={{ color: '#c0392b' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold rounded-xl transition-colors disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#d4688e]"
              style={{ backgroundColor: '#d4688e' }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#b54e74' }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#d4688e' }}
            >
              {submitting ? 'Booking…' : 'Confirm Appointment'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
