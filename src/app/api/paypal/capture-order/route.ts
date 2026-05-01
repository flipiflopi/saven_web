import { NextRequest, NextResponse } from 'next/server'

async function getPayPalToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const base = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com'

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token as string
}

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json()
    const base = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com'
    const token = await getPayPalToken()

    const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const capture = await res.json()
    return NextResponse.json(capture)
  } catch (error) {
    console.error('PayPal capture-order error:', error)
    return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 })
  }
}
