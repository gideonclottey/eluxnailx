import { prisma } from '@/lib/prisma'
import { BookingForm } from './BookingForm'

export const metadata = { title: 'Book an Appointment – Nail Studio' }

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { priceCents: 'asc' },
  })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf8f9' }}>
      {/* Header */}
      <div
        className="text-white py-10 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #d4688e 0%, #b54e74 100%)' }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-1">💅 Nail Studio</h1>
        <p className="text-white/80 text-sm">Book your appointment below</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <BookingForm services={services} />
      </div>
    </main>
  )
}
