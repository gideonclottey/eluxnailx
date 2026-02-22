'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData): Promise<{ error?: string }> {
  const name = (formData.get('name') as string)?.trim()
  const durationMinutes = Number(formData.get('durationMinutes'))
  // Accept price in dollars (e.g. "45.00") and convert to cents
  const priceInput = Number(formData.get('price'))

  if (!name) return { error: 'Service name is required.' }
  if (!durationMinutes || durationMinutes < 5) return { error: 'Duration must be at least 5 minutes.' }
  if (isNaN(priceInput) || priceInput < 0) return { error: 'Enter a valid price.' }

  const priceCents = Math.round(priceInput * 100)

  await prisma.service.create({
    data: { name, durationMinutes, priceCents, isActive: true },
  })

  revalidatePath('/admin/services')
  revalidatePath('/book')
  return {}
}

export async function updateService(formData: FormData): Promise<{ error?: string }> {
  const id = Number(formData.get('id'))
  const name = (formData.get('name') as string)?.trim()
  const durationMinutes = Number(formData.get('durationMinutes'))
  const priceInput = Number(formData.get('price'))

  if (!id) return { error: 'Missing service ID.' }
  if (!name) return { error: 'Service name is required.' }
  if (!durationMinutes || durationMinutes < 5) return { error: 'Duration must be at least 5 minutes.' }
  if (isNaN(priceInput) || priceInput < 0) return { error: 'Enter a valid price.' }

  const priceCents = Math.round(priceInput * 100)

  await prisma.service.update({
    where: { id },
    data: { name, durationMinutes, priceCents },
  })

  revalidatePath('/admin/services')
  revalidatePath('/book')
  return {}
}

export async function toggleServiceActive(formData: FormData) {
  const id = Number(formData.get('id'))
  const isActive = formData.get('isActive') === 'true'
  if (!id) return
  await prisma.service.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/services')
  revalidatePath('/book')
}
