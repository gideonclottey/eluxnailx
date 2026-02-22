'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(formData: FormData): Promise<void> {
  const password = formData.get('password') as string
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    // Redirect back with an error flag — avoids returning a value from the form action
    redirect('/admin/login?error=1')
  }

  // Store the password directly in an httpOnly cookie.
  // For a small local app this is acceptable; use a proper session store for production.
  const cookieStore = await cookies()
  cookieStore.set('admin_session', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function cancelBooking(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  await prisma.booking.update({ where: { id }, data: { status: 'cancelled' } })
}

// ─── Blocked slots ────────────────────────────────────────────────────────────

export async function addBlock(formData: FormData): Promise<{ error?: string }> {
  const date = formData.get('date') as string
  const allDay = formData.get('allDay') === 'true'
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const reason = (formData.get('reason') as string)?.trim() || null

  if (!date) return { error: 'Date is required.' }

  const tz = process.env.TIMEZONE ?? 'UTC'

  let startAt: Date
  let endAt: Date

  if (allDay) {
    // Block the entire working day
    startAt = zonedToUtc(date, 9, 0, tz)
    endAt = zonedToUtc(date, 17, 0, tz)
  } else {
    if (!startTime || !endTime) return { error: 'Start and end time are required.' }
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    startAt = zonedToUtc(date, sh, sm, tz)
    endAt = zonedToUtc(date, eh, em, tz)
    if (endAt <= startAt) return { error: 'End time must be after start time.' }
  }

  await prisma.blockedSlot.create({ data: { startAt, endAt, reason } })
  return {}
}

export async function deleteBlock(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  await prisma.blockedSlot.delete({ where: { id } })
}

// Inline helper (duplicated from slots.ts to avoid importing server-only lib in middleware)
function zonedToUtc(dateStr: string, hour: number, minute: number, tz: string): Date {
  const pad = (n: number) => String(n).padStart(2, '0')
  const ref = new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00.000Z`)
  const localStr = ref.toLocaleString('sv-SE', { timeZone: tz })
  const displayedAsUtc = new Date(localStr.replace(' ', 'T') + '.000Z')
  const offsetMs = ref.getTime() - displayedAsUtc.getTime()
  return new Date(ref.getTime() + offsetMs)
}
