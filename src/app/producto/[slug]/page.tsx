import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductCard from '@/components/ui/ProductCard'

type Props = { params: { slug: string } }

const getProduct = cache((handle: string) =>
  prisma.product.findUnique({
    where: { handle },
    include: {
      variants: { orderBy: { price: 'asc' } },
      images: { orderBy: { position: 'asc' } },
    },
  })
)

async function getRelated(vendor: string, currentHandle: string) {
  return prisma.product.findMany({
    where: { vendor, status: 'active', handle: { not: currentHandle } },
    include: {
      variants: { orderBy: { price: 'asc' }, take: 1 },
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
    take: 4,
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.title,
    description: product.description?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].src }] : [],
    },
  }
}

export default async function ProductoPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelated(product.vendor, product.handle)

  return (
    <main className="min-h-screen pt-24 pb-24 bg-dark-950">
      <div className="container-luxury">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-dark-500 text-xs tracking-widest uppercase mb-10">
          <Link href="/" className="hover:text-gold-400 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-gold-400 transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-dark-300 truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Gallery */}
          <ProductGallery
            images={product.images.map((img) => ({
              src: img.src,
              altText: img.altText,
            }))}
            title={product.title}
          />

          {/* Info */}
          <ProductInfo
            productId={product.id}
            handle={product.handle}
            title={product.title}
            vendor={product.vendor}
            description={product.description ?? ''}
            variants={product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              option1Name: v.option1Name,
              option1Value: v.option1Value,
              option2Name: v.option2Name,
              option2Value: v.option2Value,
              available: v.available,
            }))}
            imageSrc={product.images[0]?.src ?? null}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="border-t border-white/5 pt-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-subtitle mb-3">De la misma marca</p>
                <h2 className="font-serif text-3xl text-white font-light">También te puede interesar</h2>
              </div>
              <Link
                href={`/catalogo?vendor=${encodeURIComponent(product.vendor)}`}
                className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-dark-400 hover:text-gold-400 transition-colors"
              >
                Ver todos
                <ChevronLeft size={14} className="rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  handle={p.handle}
                  title={p.title}
                  vendor={p.vendor}
                  price={p.variants[0]?.price ?? 0}
                  imageSrc={p.images[0]?.src ?? null}
                  compareAtPrice={p.variants[0]?.compareAtPrice}
                />
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-dark-400 hover:text-gold-400 transition-colors"
          >
            <ChevronLeft size={14} />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}
