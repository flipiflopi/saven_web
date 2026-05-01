import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paypalId, items, total, email, name, address } = body

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
        address,
        items: {
          create: items.map((item: {
            variantId: string
            title: string
            variantTitle?: string
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

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
