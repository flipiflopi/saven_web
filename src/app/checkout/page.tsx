'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ChevronLeft, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? 'test'

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = mounted ? total() : 0

  async function createOrder() {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: subtotal.toFixed(2), currency: 'EUR' }),
    })
    const data = await res.json()
    return data.id
  }

  async function onApprove(data: { orderID: string }) {
    const res = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: data.orderID }),
    })
    const capture = await res.json()

    if (capture.status === 'COMPLETED') {
      const payer = capture.payer
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalId: data.orderID,
          items: items.map((i) => ({
            variantId: i.variantId,
            title: i.title,
            variantTitle: i.variantTitle,
            price: i.price,
            quantity: i.quantity,
          })),
          total: subtotal,
          email: payer?.email_address ?? null,
          name: `${payer?.name?.given_name ?? ''} ${payer?.name?.surname ?? ''}`.trim(),
        }),
      })
      const orderData = await orderRes.json()
      setOrderId(orderData.orderId)
      clearCart()
      setOrderSuccess(true)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen pt-28 pb-24 bg-dark-950">
        <div className="container-luxury max-w-3xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-dark-800 rounded mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-64 bg-dark-900 rounded" />
            <div className="h-64 bg-dark-900 rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen pt-28 pb-24 bg-dark-950 flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-16 h-16 border border-gold-500 flex items-center justify-center mx-auto mb-8">
            <span className="text-gold-400 text-2xl">✓</span>
          </div>
          <p className="section-subtitle mb-4">Pedido confirmado</p>
          <h1 className="font-serif text-4xl text-white font-light mb-4">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-dark-400 text-sm leading-relaxed mb-2">
            Tu pago ha sido procesado correctamente. Recibirás un email de confirmación en breve.
          </p>
          {orderId && (
            <p className="text-dark-600 text-xs tracking-widest mb-10">
              Nº de pedido: {orderId}
            </p>
          )}
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-28 pb-24 bg-dark-950 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="font-serif text-3xl text-white font-light mb-6">
            No hay artículos en el carrito
          </h1>
          <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-28 pb-24 bg-dark-950">
      <div className="container-luxury max-w-3xl mx-auto">
        <div className="mb-10">
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-dark-400 hover:text-gold-400 transition-colors mb-6"
          >
            <ChevronLeft size={14} />
            Volver al carrito
          </Link>
          <p className="section-subtitle mb-3">Paso final</p>
          <h1 className="font-serif text-4xl text-white font-light">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Order summary */}
          <div className="bg-dark-900 border border-white/5 p-6">
            <h2 className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-5">
              Resumen del pedido
            </h2>

            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="text-white font-light line-clamp-1">{item.title}</p>
                    {item.variantTitle && item.variantTitle !== 'Default Title' && (
                      <p className="text-dark-500 text-xs">{item.variantTitle}</p>
                    )}
                    <p className="text-dark-500 text-xs">× {item.quantity}</p>
                  </div>
                  <span className="text-white shrink-0">
                    {(item.price * item.quantity).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="text-white font-medium">Total</span>
              <span className="text-white text-lg font-light">
                {subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>

          {/* PayPal */}
          <div>
            <div className="flex items-center gap-2 text-dark-500 text-xs tracking-widest uppercase mb-6">
              <Lock size={12} />
              Pago seguro con PayPal
            </div>

            <PayPalScriptProvider
              options={{
                clientId: PAYPAL_CLIENT_ID,
                currency: 'EUR',
                intent: 'capture',
              }}
            >
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'pay',
                  height: 48,
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={(err) => console.error('PayPal error:', err)}
              />
            </PayPalScriptProvider>

            <p className="text-dark-600 text-xs text-center mt-4 leading-relaxed">
              Al completar el pago aceptas nuestros{' '}
              <Link href="/terminos" className="text-dark-400 hover:text-gold-400 transition-colors">
                términos y condiciones
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
