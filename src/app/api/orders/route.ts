import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmails } from '@/lib/emails'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paypalId, items, subtotal, shipping, total, email, name, phone, address } = body

    if (!items?.length || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        paypalId,
        status: 'paid',
        total,
        currency: 'EUR',
        email,
        name,
        phone: phone ?? null,
        shipping: shipping ?? 0,
        address,
        items: {
          create: items.map((item: {
            variantId: string
            title: string
            variantTitle?: string
            sku?: string
            price: number
            quantity: number
          }) => ({
            variantId: item.variantId,
            title: item.title,
            variantTitle: item.variantTitle ?? null,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    })

    // Enviar emails en background — no bloqueamos la respuesta
    if (email && address) {
      sendOrderEmails({
        orderId: order.id,
        paypalId: paypalId ?? '',
        name: name ?? '',
        email,
        items,
        subtotal: subtotal ?? (total - (shipping ?? 0)),
        shipping: shipping ?? 0,
        total,
        address,
        createdAt: order.createdAt,
      }).catch((err) => console.error('[emails] Error sending order emails:', err))
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
