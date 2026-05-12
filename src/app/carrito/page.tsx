'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { getShippingCost, COUNTRIES, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, total, country, setCountry } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = mounted ? total() : 0
  const shipping = mounted ? getShippingCost(country, subtotal) : 0
  const grandTotal = subtotal + shipping

  if (!mounted) {
    return (
      <main className="min-h-screen pt-28 pb-24 bg-dark-950">
        <div className="container-luxury animate-pulse">
          <div className="h-8 w-48 bg-dark-800 rounded mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-dark-900 rounded" />
              ))}
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
          <ShoppingBag size={48} className="text-dark-700 mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-white font-light mb-4">Tu carrito está vacío</h1>
          <p className="text-dark-400 text-sm mb-10 max-w-sm mx-auto">
            Explora nuestra colección y encuentra el reloj que te define.
          </p>
          <Link href="/catalogo" className="btn-primary">
            Ver catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-28 pb-24 bg-dark-950">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="section-subtitle mb-3">Resumen</p>
            <h1 className="font-serif text-4xl text-white font-light">Tu Carrito</h1>
          </div>
          <Link
            href="/catalogo"
            className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-dark-400 hover:text-gold-400 transition-colors"
          >
            <ChevronLeft size={14} />
            Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Items list */}
          <div className="lg:col-span-2">
            {/* Column headers — desktop */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-6 pb-4 border-b border-white/5 text-xs tracking-[0.2em] uppercase text-dark-500 mb-2">
              <span>Producto</span>
              <span className="text-center w-28">Cantidad</span>
              <span className="text-right w-24">Precio</span>
              <span className="w-6" />
            </div>

            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={item.variantId} className="py-6 grid grid-cols-[auto_1fr] gap-5 md:grid-cols-[auto_1fr_auto_auto_auto] md:gap-6 items-center">
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-dark-900 shrink-0 overflow-hidden">
                    {item.imageSrc ? (
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif text-2xl text-dark-700">S</span>
                      </div>
                    )}
                  </div>

                  {/* Title + variant */}
                  <div className="min-w-0">
                    <Link
                      href={`/producto/${item.handle}`}
                      className="text-white text-sm font-light hover:text-gold-400 transition-colors line-clamp-2 leading-snug"
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && item.variantTitle !== 'Default Title' && (
                      <p className="text-dark-500 text-xs mt-1 tracking-wider">{item.variantTitle}</p>
                    )}
                    {/* Mobile price */}
                    <p className="text-gold-400 text-sm mt-2 md:hidden">
                      {(item.price * item.quantity).toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-white/10 col-start-2 md:col-start-auto w-fit ml-auto md:ml-0">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-white transition-colors"
                      aria-label="Reducir"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm text-white select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-white transition-colors"
                      aria-label="Aumentar"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line price — desktop */}
                  <div className="hidden md:block text-right w-24">
                    <span className="text-white text-sm">
                      {(item.price * item.quantity).toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                    <p className="text-dark-600 text-xs mt-0.5">
                      {item.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} c/u
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-dark-600 hover:text-red-400 transition-colors p-1"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <aside>
            <div className="bg-dark-900 border border-white/5 p-6 sticky top-28">
              <h2 className="font-serif text-xl text-white font-light mb-6">Resumen del pedido</h2>

              {/* Country selector */}
              <div className="mb-5">
                <label className="block text-xs tracking-[0.2em] uppercase text-dark-400 mb-2">
                  País de envío
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-dark-950 border border-white/10 text-white text-sm px-3 py-2.5 appearance-none focus:outline-none focus:border-gold-500 transition-colors"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-white">
                    {subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Envío</span>
                  <span className={shipping === 0 && subtotal > 0 ? 'text-gold-400 text-xs tracking-widest uppercase' : 'text-white'}>
                    {subtotal === 0
                      ? <span className="text-dark-500 text-xs">—</span>
                      : shipping === 0
                      ? 'Gratis'
                      : shipping.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-dark-500 text-xs">
                    Envío gratis a partir de {FREE_SHIPPING_THRESHOLD}€
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white text-lg font-light">
                    {grandTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <p className="text-dark-500 text-xs mt-1">Impuestos incluidos</p>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-between group">
                Finalizar pedido
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="mt-6 space-y-2">
                {[
                  'Pago 100% seguro con PayPal',
                  'Autenticidad garantizada',
                  'Envío a todo el mundo',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-dark-500 text-xs">
                    <div className="w-1 h-1 rounded-full bg-gold-600 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile continue */}
        <div className="mt-8 md:hidden">
          <Link
            href="/catalogo"
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-dark-400 hover:text-gold-400 transition-colors"
          >
            <ChevronLeft size={14} />
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}
