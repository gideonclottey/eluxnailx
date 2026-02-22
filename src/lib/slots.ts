// Slot generation and availability helpers

export const WORK_START_H = 9   // 09:00
export const WORK_END_H = 17    // 17:00
export const SLOT_MINUTES = 30

/**
 * Convert a local date/time (in `tz`) to a UTC Date.
 *
 * Strategy: create a reference Date by treating the local timestamp as UTC,
 * then measure what that UTC time shows in the target timezone, compute the
 * offset, and shift accordingly. This handles DST correctly via Intl.
 */
export function zonedToUtc(dateStr: string, hour: number, minute: number, tz: string): Date {
  const pad = (n: number) => String(n).padStart(2, '0')
  // Treat the local time as UTC temporarily
  const ref = new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00.000Z`)
  // What local time does this UTC instant show in the target timezone?
  const localStr = ref.toLocaleString('sv-SE', { timeZone: tz }) // "YYYY-MM-DD HH:MM:SS"
  // Parse that as if it were UTC to get its "number value"
  const displayedAsUtc = new Date(localStr.replace(' ', 'T') + '.000Z')
  // offset = ref - displayedAsUtc (positive when tz is ahead of UTC)
  const offsetMs = ref.getTime() - displayedAsUtc.getTime()
  return new Date(ref.getTime() + offsetMs)
}

/**
 * Generate valid 30-min slot start times for `dateStr` in `tz` for a
 * service of `durationMinutes`. Only includes slots where the service
 * finishes by WORK_END.
 */
export function generateDaySlots(dateStr: string, durationMinutes: number, tz: string): Date[] {
  const slots: Date[] = []

  for (let h = WORK_START_H; h < WORK_END_H; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const slotTotalMinutes = h * 60 + m
      const endTotalMinutes = slotTotalMinutes + durationMinutes
      // Service must finish by WORK_END
      if (endTotalMinutes > WORK_END_H * 60) continue

      slots.push(zonedToUtc(dateStr, h, m, tz))
    }
  }

  return slots
}

/**
 * Remove slots that overlap with any existing booking or blocked period,
 * and remove slots already in the past.
 */
export function filterAvailableSlots(
  slots: Date[],
  durationMinutes: number,
  bookings: { startAt: Date; endAt: Date }[],
  blocks: { startAt: Date; endAt: Date }[],
): Date[] {
  const now = new Date()

  return slots.filter((slot) => {
    if (slot <= now) return false // past
    const end = new Date(slot.getTime() + durationMinutes * 60_000)

    for (const b of bookings) {
      if (slot < b.endAt && end > b.startAt) return false
    }
    for (const bl of blocks) {
      if (slot < bl.endAt && end > bl.startAt) return false
    }
    return true
  })
}
