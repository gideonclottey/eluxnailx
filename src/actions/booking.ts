'use server'

import { prisma } from '@/lib/prisma'
import { sendBookingEmail } from '@/lib/email'

interface BookingResult {
  error?: string
  success?: boolean
}

export async function createBooking(formData: FormData): Promise<BookingResult> {
  // --- Parse & validate inputs ---
  const serviceId = Number(formData.get('serviceId'))
  const slotUtc = formData.get('slotUtc') as string
  const customerName = (formData.get('customerName') as string)?.trim()
  const customerEmail = (formData.get('customerEmail') as string)?.trim()
  const customerPhone = (formData.get('customerPhone') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!serviceId || !slotUtc || !customerName || !customerEmail) {
    return { error: 'Please fill in all required fields.' }
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(customerEmail)) {
    return { error: 'Please enter a valid email address.' }
  }

  const startAt = new Date(slotUtc)
  if (isNaN(startAt.getTime())) {
    return { error: 'Invalid time slot.' }
  }

  if (startAt <= new Date()) {
    return { error: 'That time slot is in the past.' }
  }

  // --- Load service ---
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  })
  if (!service) return { error: 'Service not found.' }

  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000)

  // --- Create booking inside a transaction to prevent double-booking ---
  try {
    await prisma.$transaction(async (tx) => {
      // Check for overlapping confirmed bookings
      const clash = await tx.booking.findFirst({
        where: {
          status: 'confirmed',
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      })
      if (clash) throw new Error('SLOT_TAKEN')

      // Check for overlapping blocked slots
      const blocked = await tx.blockedSlot.findFirst({
        where: {
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      })
      if (blocked) throw new Error('SLOT_BLOCKED')

      await tx.booking.create({
        data: {
          serviceId,
          startAt,
          endAt,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          status: 'confirmed',
        },
      })
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'SLOT_TAKEN') return { error: 'That slot was just booked. Please choose another time.' }
    if (msg === 'SLOT_BLOCKED') return { error: 'That slot is unavailable. Please choose another time.' }
    console.error('Booking error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  // --- Send email (best-effort — don't fail the booking if email fails) ---
  try {
    await sendBookingEmail({
      customerName,
      customerEmail,
      customerPhone,
      notes,
      serviceName: service.name,
      startAt,
      endAt,
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }

  return { success: true }
}
