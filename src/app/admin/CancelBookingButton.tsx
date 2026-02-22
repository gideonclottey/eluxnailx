'use client'

import { cancelBooking } from '@/actions/admin'

export function CancelBookingButton({ id }: { id: number }) {
  return (
    <form action={cancelBooking}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm px-3 py-1.5 border-2 border-red-200 text-red-500 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
        onClick={(e) => {
          if (!confirm('Cancel this booking?')) e.preventDefault()
        }}
      >
        Cancel
      </button>
    </form>
  )
}
