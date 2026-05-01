import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import CatalogoClient from './CatalogoClient'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      variants: { orderBy: { price: 'asc' }, take: 1 },
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  const vendors = Array.from(new Set(products.map((p) => p.vendor))).sort()

  const serialized = products.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    price: p.variants[0]?.price ?? 0,
    compareAtPrice: p.variants[0]?.compareAtPrice ?? null,
    imageSrc: p.images[0]?.src ?? null,
  }))

  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950" />}>
      <CatalogoClient products={serialized} vendors={vendors} />
    </Suspense>
  )
}
