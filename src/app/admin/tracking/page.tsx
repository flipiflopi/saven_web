import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isValidAdminSession, COOKIE_NAME } from '@/lib/admin-auth'
import AdminTrackingClient from './AdminTrackingClient'

export const dynamic = 'force-dynamic'

export default async function AdminTrackingPage() {
  const cookieStore = cookies()
  const session = cookieStore.get(COOKIE_NAME)?.value
  if (!isValidAdminSession(session)) redirect('/admin/login')

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  // Pendientes primero, enviados al final
  const pending  = orders.filter(o => o.status !== 'shipped')
  const shipped  = orders.filter(o => o.status === 'shipped')
  const sorted   = [...pending, ...shipped]

  const serializable = sorted.map(o => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    name: o.name,
    email: o.email,
    total: o.total,
    shipping: o.shipping,
    trackingNumber: o.trackingNumber,
    shippedAt: o.shippedAt?.toISOString() ?? null,
    address: o.address as {
      line1?: string; city?: string; postalCode?: string
      country?: string; countryName?: string
    } | null,
    items: o.items.map(i => ({
      title: i.title,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      price: i.price,
    })),
  }))

  return <AdminTrackingClient orders={serializable} />
}
