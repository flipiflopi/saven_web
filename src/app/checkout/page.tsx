'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ChevronLeft, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { getShippingCost, COUNTRIES } from '@/lib/shipping'

const PAYPAL_CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '').trim()

type AddressForm = {
  name: string
  email: string
  phone: string
  line1: string
  city: string
  postalCode: string
  country: string
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const router = useRouter()
  const { items, total, clearCart, country: cartCountry } = useCartStore()

  const [form, setForm] = useState<AddressForm>({
    name: '',
    email: '',
    phone: '',
    line1: '',
    city: '',
    postalCode: '',
    country: 'ES',
  })

  useEffect(() => {
    setMounted(true)
    setForm((f) => ({ ...f, country: cartCountry }))
  }, [cartCountry])

  const subtotal  = mounted ? total() : 0
  const shipping  = mounted ? getShippingCost(form.country, subtotal) : 0
  const grandTotal = subtotal + shipping

  const countryName = COUNTRIES.find((c) => c.code === form.country)?.name ?? form.country

  const formValid =
    form.name.trim().length > 1 &&
    form.email.includes('@') &&
    form.line1.trim().length > 3 &&
    form.city.trim().length > 1 &&
    form.postalCode.trim().length > 2 &&
    form.country.length === 2

  function field(key: keyof AddressForm) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  async function createOrder() {
    if (!formValid) {
      setPaypalError('Por favor, completa todos los campos de envío antes de pagar.')
      throw new Error('form incomplete')
    }
    setPaypalError(null)
    const res  = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grandTotal.toFixed(2), currency: 'EUR' }),
    })
    const data = await res.json()
    if (!data.id) {
      const msg = data.error ?? 'No se pudo crear la orden en PayPal'
      setPaypalError(msg)
      throw new Error(msg)
    }
    return data.id
  }

  async function onApprove(data: { orderID: string }) {
    const captureRes = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: data.orderID }),
    })
    const capture = await captureRes.json()

    if (capture.status === 'COMPLETED') {
      const address = {
        line1: form.line1,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
        countryName,
        phone: form.phone || undefined,
      }

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
          subtotal,
          shipping,
          total: grandTotal,
          email: form.email,
          name: form.name,
          phone: form.phone || null,
          address,
        }),
      })
      const orderData = await orderRes.json()
      clearCart()
      router.push(`/pedido-confirmado?id=${orderData.orderId}`)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen pt-28 pb-24 bg-dark-950">
        <div className="container-luxury max-w-4xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-dark-800 rounded mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-dark-900 rounded" />)}
            </div>
            <div className="h-64 bg-dark-900 rounded" />
          </div>
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

  const inputCls = 'w-full bg-dark-950 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors placeholder:text-dark-600'
  const labelCls = 'block text-xs tracking-[0.15em] uppercase text-dark-400 mb-1.5'

  return (
    <main className="min-h-screen pt-28 pb-24 bg-dark-950">
      <div className="container-luxury max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Shipping address form ── */}
          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-6">Dirección de envío</h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Nombre completo *</label>
                <input className={inputCls} placeholder="María García López" {...field('name')} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input className={inputCls} type="email" placeholder="maria@email.com" {...field('email')} />
              </div>
              <div>
                <label className={labelCls}>Teléfono (opcional)</label>
                <input className={inputCls} type="tel" placeholder="+34 600 000 000" {...field('phone')} />
              </div>
              <div>
                <label className={labelCls}>Dirección *</label>
                <input className={inputCls} placeholder="Calle Mayor 1, 3º B" {...field('line1')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ciudad *</label>
                  <input className={inputCls} placeholder="Madrid" {...field('city')} />
                </div>
                <div>
                  <label className={labelCls}>Código postal *</label>
                  <input className={inputCls} placeholder="28001" {...field('postalCode')} />
                </div>
              </div>
              <div>
                <label className={labelCls}>País *</label>
                <select
                  className="w-full bg-dark-950 border border-white/10 text-white text-sm px-3 py-2.5 appearance-none focus:outline-none focus:border-gold-500 transition-colors"
                  {...field('country')}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Right: Summary + PayPal ── */}
          <div>
            {/* Order summary */}
            <div className="bg-dark-900 border border-white/5 p-6 mb-6">
              <h2 className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-5">Resumen</h2>
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
                      {(item.price * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-white">{subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Envío — {countryName}</span>
                  <span className="text-white">
                    {shipping === 0 ? 'Gratis' : shipping.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white text-lg font-light">
                    {grandTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="flex items-center gap-2 text-dark-500 text-xs tracking-widest uppercase mb-4">
              <Lock size={12} />
              Pago seguro con PayPal
            </div>

            {!formValid && (
              <p className="text-dark-500 text-xs mb-4">
                Completa la dirección de envío para activar el pago.
              </p>
            )}

            {paypalError && (
              <div className="bg-dark-900 border border-red-500/30 p-4 text-red-400 text-sm mb-4">
                {paypalError}
              </div>
            )}

            {!PAYPAL_CLIENT_ID ? (
              <div className="bg-dark-900 border border-red-500/30 p-4 text-red-400 text-sm">
                Error de configuración: PayPal no está configurado.
              </div>
            ) : (
              <div className={!formValid ? 'opacity-40 pointer-events-none' : ''}>
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR', intent: 'capture' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                      console.error('PayPal error:', err)
                      setPaypalError('Error al procesar el pago. Por favor, inténtalo de nuevo.')
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            <p className="text-dark-600 text-xs text-center mt-4 leading-relaxed">
              Al completar el pago aceptas nuestros{' '}
              <Link href="/terminos" className="text-dark-400 hover:text-gold-400 transition-colors">
                términos y condiciones
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
