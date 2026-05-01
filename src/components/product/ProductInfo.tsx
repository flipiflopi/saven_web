'use client'

import { useState } from 'react'
import { ShoppingBag, Minus, Plus, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'

type Variant = {
  id: string
  sku: string | null
  price: number
  compareAtPrice: number | null
  option1Name: string | null
  option1Value: string | null
  option2Name: string | null
  option2Value: string | null
  available: boolean
}

type Props = {
  productId: string
  handle: string
  title: string
  vendor: string
  description: string
  variants: Variant[]
  imageSrc: string | null
}

export default function ProductInfo({
  productId,
  handle,
  title,
  vendor,
  description,
  variants,
  imageSrc,
}: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selected = variants.find((v) => v.id === selectedVariantId) ?? variants[0]

  // Group variants by option1
  const hasOptions =
    variants.length > 1 || (variants[0]?.option1Value && variants[0].option1Value !== 'Default Title')

  const option1Name = variants[0]?.option1Name
  const option1Values = hasOptions
    ? Array.from(new Set(variants.map((v) => v.option1Value).filter(Boolean)))
    : []

  const option2Name = variants[0]?.option2Name
  const option2Values = hasOptions
    ? Array.from(new Set(variants.map((v) => v.option2Value).filter(Boolean)))
    : []

  function selectByOptions(opt1: string | null | undefined, opt2?: string | null) {
    const match = variants.find(
      (v) =>
        v.option1Value === (opt1 ?? v.option1Value) &&
        (opt2 === undefined || v.option2Value === opt2)
    )
    if (match) setSelectedVariantId(match.id)
  }

  function handleAddToCart() {
    if (!selected) return
    addItem({
      variantId: selected.id,
      productId,
      title,
      variantTitle: selected.option1Value ?? null,
      price: selected.price,
      quantity,
      imageSrc,
      handle,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const hasDiscount = selected?.compareAtPrice && selected.compareAtPrice > selected.price

  return (
    <div className="flex flex-col gap-6">
      {/* Vendor + title */}
      <div>
        <p className="section-subtitle mb-3">{vendor}</p>
        <h1 className="font-serif text-3xl md:text-4xl text-white font-light leading-snug">
          {title}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-2xl text-white font-light">
          {selected?.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </span>
        {hasDiscount && (
          <span className="text-dark-500 line-through text-base">
            {selected!.compareAtPrice!.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
        )}
        {hasDiscount && (
          <span className="text-xs bg-gold-500 text-dark-950 px-2 py-0.5 font-medium uppercase tracking-widest">
            Oferta
          </span>
        )}
      </div>

      <div className="w-12 h-px bg-gold-500/40" />

      {/* Option 1 selector */}
      {hasOptions && option1Values.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-3">
            {option1Name ?? 'Opción'}:{' '}
            <span className="text-white">{selected?.option1Value}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {option1Values.map((val) => {
              const isSelected = selected?.option1Value === val
              const variant = variants.find((v) => v.option1Value === val)
              return (
                <button
                  key={val}
                  onClick={() => selectByOptions(val)}
                  disabled={!variant?.available}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                    isSelected
                      ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                      : 'border-white/10 text-dark-400 hover:border-white/30 hover:text-white'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Option 2 selector */}
      {option2Values.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-3">
            {option2Name ?? 'Opción 2'}:{' '}
            <span className="text-white">{selected?.option2Value}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {option2Values.map((val) => {
              const isSelected = selected?.option2Value === val
              return (
                <button
                  key={val}
                  onClick={() => selectByOptions(selected?.option1Value, val)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                    isSelected
                      ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                      : 'border-white/10 text-dark-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="flex items-stretch gap-3">
        {/* Quantity */}
        <div className="flex items-center border border-white/10">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-full flex items-center justify-center text-dark-400 hover:text-white transition-colors"
            aria-label="Reducir cantidad"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm text-white select-none">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-full flex items-center justify-center text-dark-400 hover:text-white transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!selected?.available}
          className={`flex-1 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 ${
            added
              ? 'bg-green-700 text-white'
              : 'btn-primary disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check size={16} />
              Añadido
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              {selected?.available ? 'Añadir al carrito' : 'Sin stock'}
            </>
          )}
        </button>
      </div>

      {/* SKU */}
      {selected?.sku && (
        <p className="text-dark-600 text-xs tracking-widest">REF: {selected.sku}</p>
      )}

      {/* Description */}
      {description && (
        <div className="border-t border-white/5 pt-6">
          <p className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-4">Descripción</p>
          <div
            className="prose-luxury text-dark-300 text-sm font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}
    </div>
  )
}
