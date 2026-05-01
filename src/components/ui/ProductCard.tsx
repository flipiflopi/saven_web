import Link from 'next/link'
import Image from 'next/image'

type Props = {
  handle: string
  title: string
  vendor: string
  price: number
  imageSrc: string | null
  compareAtPrice?: number | null
}

export default function ProductCard({ handle, title, vendor, price, imageSrc, compareAtPrice }: Props) {
  const hasDiscount = compareAtPrice && compareAtPrice > price

  return (
    <Link href={`/producto/${handle}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square bg-dark-900 overflow-hidden mb-5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-4xl text-dark-700 tracking-widest">S</span>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-gold-500 text-dark-950 text-[10px] font-semibold px-2 py-1 tracking-widest uppercase">
            Oferta
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/20 transition-colors duration-500 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
          <span className="btn-outline text-xs py-2 px-6">Ver producto</span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-1 font-sans">{vendor}</p>
        <h3 className="text-white font-sans text-sm font-light leading-snug mb-2 group-hover:text-gold-300 transition-colors">
          {title}
        </h3>
        <div className="flex items-baseline gap-3">
          <span className="text-white font-light text-sm">
            {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
          {hasDiscount && (
            <span className="text-dark-500 text-xs line-through">
              {compareAtPrice!.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
