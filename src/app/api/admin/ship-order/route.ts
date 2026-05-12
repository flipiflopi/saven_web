import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTrackingEmail } from '@/lib/emails'
import { isValidAdminSession, COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { orderId, trackingNumber } = await request.json()

  if (!orderId || !trackingNumber?.trim()) {
    return NextResponse.json({ error: 'orderId y trackingNumber son requeridos' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'shipped',
      trackingNumber: trackingNumber.trim(),
      shippedAt: new Date(),
    },
    include: { items: true },
  })

  // Enviar email de tracking al cliente
  if (order.email && order.address) {
    const address = order.address as {
      line1: string; city: string; postalCode: string
      country: string; countryName: string; phone?: string
    }
    sendTrackingEmail({
      orderId: order.id,
      name: order.name ?? 'Cliente',
      email: order.email,
      trackingNumber: trackingNumber.trim(),
      items: order.items.map(i => ({
        title: i.title,
        variantTitle: i.variantTitle,
        price: i.price,
        quantity: i.quantity,
      })),
      address,
    }).catch(err => console.error('[ship-order] Email error:', err))
  }

  return NextResponse.json({ ok: true })
}
