import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDaySlots, filterAvailableSlots } from '@/lib/slots'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceId = Number(searchParams.get('serviceId'))
  const date = searchParams.get('date') // "YYYY-MM-DD"

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const tz = process.env.TIMEZONE ?? 'UTC'

  // Day boundaries in UTC for DB queries (generous ±1 day to cover all timezones)
  const dayStart = new Date(`${date}T00:00:00Z`)
  dayStart.setUTCDate(dayStart.getUTCDate() - 1)
  const dayEnd = new Date(`${date}T00:00:00Z`)
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 2)

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: 'confirmed',
        startAt: { gte: dayStart, lt: dayEnd },
      },
      select: { startAt: true, endAt: true },
    }),
    prisma.blockedSlot.findMany({
      where: {
        startAt: { gte: dayStart, lt: dayEnd },
      },
      select: { startAt: true, endAt: true },
    }),
  ])

  const allSlots = generateDaySlots(date, service.durationMinutes, tz)
  const available = filterAvailableSlots(allSlots, service.durationMinutes, bookings, blocks)

  return NextResponse.json({ slots: available.map((d) => d.toISOString()) })
}
