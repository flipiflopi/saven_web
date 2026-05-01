import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ui/ProductCard'

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { status: 'active', featured: true },
      include: {
        variants: { orderBy: { price: 'asc' }, take: 1 },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      take: 6,
    })
  } catch {
    return []
  }
}

async function getRecentProducts() {
  try {
    return await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        variants: { orderBy: { price: 'asc' }, take: 1 },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
  } catch {
    return []
  }
}

export default async function FeaturedSection() {
  let products = await getFeaturedProducts()
  if (products.length === 0) products = await getRecentProducts()

  return (
    <section id="coleccion" className="py-32 bg-dark-950">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="section-subtitle mb-4">Selección</p>
            <h2 className="section-title">Colección<br />Destacada</h2>
          </div>
          <Link href="/catalogo" className="btn-outline self-start">
            Ver todo el catálogo
          </Link>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {products.map((product) => {
              const variant = product.variants[0]
              const image = product.images[0]
              return (
                <ProductCard
                  key={product.id}
                  handle={product.handle}
                  title={product.title}
                  vendor={product.vendor}
                  price={variant?.price ?? 0}
                  imageSrc={image?.src ?? null}
                  compareAtPrice={variant?.compareAtPrice}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 border border-white/5">
            <p className="font-serif text-4xl text-dark-700 mb-4">Próximamente</p>
            <p className="text-dark-500 text-sm tracking-widest uppercase">
              La colección está siendo preparada
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
