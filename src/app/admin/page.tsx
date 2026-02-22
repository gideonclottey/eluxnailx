import { prisma } from '@/lib/prisma'
import { addBlock, deleteBlock, logout } from '@/actions/admin'
import BlockSlotForm from './BlockSlotForm'
import { CancelBookingButton } from './CancelBookingButton'

export const metadata = { title: 'Admin Dashboard – Nail Studio' }

// Helpers
const tz = process.env.TIMEZONE ?? 'UTC'
const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const dateFilter = params.date // "YYYY-MM-DD" or undefined

  // Build booking query
  const bookingWhere: Parameters<typeof prisma.booking.findMany>[0] = {
    where: {
      status: 'confirmed',
      ...(dateFilter
        ? {
            startAt: {
              gte: new Date(`${dateFilter}T00:00:00Z`),
              lt: new Date(`${dateFilter}T23:59:59Z`),
            },
          }
        : { startAt: { gte: new Date() } }),
    },
  }

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      ...bookingWhere,
      include: { service: true },
      orderBy: { startAt: 'asc' },
      take: 100,
    }),
    prisma.blockedSlot.findMany({
      where: { endAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
    }),
  ])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf8f9' }}>
      {/* Top bar */}
      <div
        className="text-white px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #d4688e 0%, #b54e74 100%)' }}
      >
        <div>
          <h1 className="text-xl font-bold">💅 Admin Dashboard</h1>
          <p className="text-white/70 text-xs">Nail Studio</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/book" className="text-white/80 hover:text-white text-sm underline">
            ← Booking page
          </a>
          <form action={logout}>
            <button className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter */}
          <div className="bg-white rounded-2xl border border-[#e8c5d2] p-5">
            <h2 className="font-semibold text-[#2d2d2d] mb-3">
              Upcoming Bookings {dateFilter && <span className="text-sm font-normal text-gray-400">for {dateFilter}</span>}
            </h2>
            <form method="GET" className="flex gap-2">
              <input
                type="date"
                name="date"
                defaultValue={dateFilter ?? ''}
                className="flex-1 p-2 text-sm border-2 border-[#e8c5d2] rounded-xl focus:outline-none focus:border-[#d4688e]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white rounded-xl"
                style={{ backgroundColor: '#d4688e' }}
              >
                Filter
              </button>
              {dateFilter && (
                <a
                  href="/admin"
                  className="px-4 py-2 text-sm border-2 border-[#e8c5d2] rounded-xl text-[#2d2d2d] hover:border-[#d4688e] transition-colors"
                >
                  Clear
                </a>
              )}
            </form>
          </div>

          {/* Booking list */}
          {bookings.length === 0 ? (
            <p className="text-gray-400 text-sm px-1">No upcoming bookings.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[#e8c5d2] p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#2d2d2d]">{b.customerName}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: '#d4688e' }}
                      >
                        {b.service.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {fmtDate(b.startAt)} · {fmtTime(b.startAt)} – {fmtTime(b.endAt)}
                    </p>
                    <p className="text-sm text-gray-500">{b.customerEmail}</p>
                    {b.customerPhone && (
                      <p className="text-sm text-gray-400">{b.customerPhone}</p>
                    )}
                    {b.notes && (
                      <p className="text-sm text-gray-400 mt-1 italic">"{b.notes}"</p>
                    )}
                  </div>
                  {/* Client component handles the confirm() dialog */}
                  <CancelBookingButton id={b.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: block slots */}
        <div className="space-y-6">
          {/* Add block form */}
          <div className="bg-white rounded-2xl border border-[#e8c5d2] p-5">
            <h2 className="font-semibold text-[#2d2d2d] mb-4">Block a Date / Time</h2>
            <BlockSlotForm />
          </div>

          {/* Existing blocks */}
          {blocks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e8c5d2] p-5">
              <h2 className="font-semibold text-[#2d2d2d] mb-3">Active Blocks</h2>
              <div className="space-y-3">
                {blocks.map((bl) => (
                  <div key={bl.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2d2d2d]">
                        {fmtDate(bl.startAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {fmtTime(bl.startAt)} – {fmtTime(bl.endAt)}
                      </p>
                      {bl.reason && (
                        <p className="text-xs text-gray-400 italic">{bl.reason}</p>
                      )}
                    </div>
                    <form action={deleteBlock}>
                      <input type="hidden" name="id" value={bl.id} />
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

