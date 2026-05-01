'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  images: { src: string; altText: string | null }[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1))

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-dark-900 flex items-center justify-center">
        <span className="font-serif text-8xl text-dark-700 tracking-widest">S</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square bg-dark-900 overflow-hidden group">
        <Image
          key={images[active].src}
          src={images[active].src}
          alt={images[active].altText ?? title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          priority={active === 0}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-dark-950/70 hover:bg-dark-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-dark-950/70 hover:bg-dark-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={18} className="text-white" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === active ? 'bg-gold-400 w-4' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 shrink-0 overflow-hidden transition-all ${
                i === active
                  ? 'ring-1 ring-gold-500'
                  : 'ring-1 ring-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.src}
                alt={img.altText ?? `${title} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
