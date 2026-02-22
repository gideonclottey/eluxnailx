import { prisma } from '@/lib/prisma'
import { ServicesManager } from '../ServicesManager'
import { logout } from '@/actions/admin'

export const metadata = { title: 'Manage Services – Nail Studio Admin' }

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { id: 'asc' } })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf8f9' }}>
      {/* Top bar */}
      <div
        className="text-white px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #d4688e 0%, #b54e74 100%)' }}
      >
        <div>
          <h1 className="text-xl font-bold">💅 Manage Services</h1>
          <p className="text-white/70 text-xs">Nail Studio</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-white/80 hover:text-white text-sm underline">
            ← Dashboard
          </a>
          <a href="/book" className="text-white/80 hover:text-white text-sm underline">
            Booking page
          </a>
          <form action={logout}>
            <button className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#e8c5d2] p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-[#2d2d2d] text-lg">Services</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Edit names, prices, and durations. Deactivated services won't appear on the booking page.
            </p>
          </div>
          <ServicesManager services={services} />
        </div>
      </div>
    </main>
  )
}
