import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Upsert services so the seed is idempotent
  const services = [
    { id: 1, name: 'Classic Manicure', durationMinutes: 45, priceCents: 3000 },
    { id: 2, name: 'Gel Manicure', durationMinutes: 60, priceCents: 4500 },
    { id: 3, name: 'Acrylic Full Set', durationMinutes: 90, priceCents: 6500 },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: s,
      create: { ...s, isActive: true },
    })
  }

  console.log('✅ Seeded 3 services')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
