'use client'

import { useState } from 'react'
import { addBlock } from '@/actions/admin'

export default function BlockSlotForm() {
  const [allDay, setAllDay] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    fd.set('allDay', String(allDay))
    const result = await addBlock(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    }
  }

  const INPUT =
    'w-full p-2 text-sm border-2 border-[#e8c5d2] rounded-xl focus:outline-none focus:border-[#d4688e] transition-colors'

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Date *</label>
        <input type="date" name="date" required className={INPUT} />
      </div>

      {/* All day toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4 accent-[#d4688e]"
        />
        <span className="text-sm text-[#2d2d2d]">Block entire day (9 AM – 5 PM)</span>
      </label>

      {/* Custom time range */}
      {!allDay && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Start time *</label>
            <input type="time" name="startTime" required={!allDay} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d] mb-1">End time *</label>
            <input type="time" name="endTime" required={!allDay} className={INPUT} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Reason (optional)</label>
        <input type="text" name="reason" placeholder="e.g. Day off, Vacation" className={INPUT} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">Block added ✓</p>}

      <button
        type="submit"
        className="w-full py-2 text-sm text-white font-semibold rounded-xl transition-colors"
        style={{ backgroundColor: '#d4688e' }}
      >
        Add Block
      </button>
    </form>
  )
}
