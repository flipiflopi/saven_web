import { NextRequest, NextResponse } from 'next/server'

async function getPayPalToken() {
  const clientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '').trim()
  const secret   = (process.env.PAYPAL_CLIENT_SECRET ?? '').trim()
  const base     = (process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com').trim()

  const res  = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()

  if (!data.access_token) {
    console.error('[PayPal] Token error:', JSON.stringify(data))
    throw new Error(`PayPal auth failed: ${data.error_description ?? data.error ?? 'unknown'}`)
  }

  return data.access_token as string
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'EUR' } = await request.json()
    const base  = (process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com').trim()
    const token = await getPayPalToken()

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: String(amount) } }],
      }),
    })

    const order = await res.json()

    if (!order.id) {
      console.error('[PayPal] create-order error:', JSON.stringify(order))
      return NextResponse.json(
        { error: order.message ?? order.name ?? 'PayPal rejected the order' },
        { status: 400 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[PayPal] create-order exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
