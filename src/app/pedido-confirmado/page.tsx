'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmadoContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const shortId = id ? `#${id.slice(-8).toUpperCase()}` : ''

  return (
    <main className="min-h-screen pt-28 pb-24 bg-dark-950 flex items-center justify-center">
      <div className="text-center px-6 max-w-lg">

        {/* Icon */}
        <div className="w-20 h-20 border border-gold-500/50 flex items-center justify-center mx-auto mb-10">
          <span className="text-gold-400 text-3xl">✓</span>
        </div>

        <p className="section-subtitle mb-4">Pedido confirmado</p>

        <h1 className="font-serif text-4xl md:text-5xl text-white font-light mb-6">
          ¡Gracias por tu compra!
        </h1>

        {shortId && (
          <p className="text-dark-500 text-xs tracking-[0.3em] uppercase mb-4">
            Pedido {shortId}
          </p>
        )}

        <p className="text-dark-400 text-sm leading-relaxed mb-3 max-w-sm mx-auto">
          Tu pago ha sido procesado correctamente.
          Recibirás un email de confirmación con los detalles del pedido.
        </p>

        <p className="text-dark-500 text-sm mb-10">
          Plazo de entrega estimado:{' '}
          <span className="text-white">7–14 días laborables</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Volver a la tienda
          </Link>
          <Link href="/catalogo" className="btn-outline">
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense>
      <ConfirmadoContent />
    </Suspense>
  )
}
