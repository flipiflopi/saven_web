'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

type Product = {
  id: string
  handle: string
  title: string
  vendor: string
  price: number
  compareAtPrice: number | null
  imageSrc: string | null
}

type Props = {
  products: Product[]
  vendors: string[]
}

const PRICE_RANGES = [
  { label: 'Todos los precios', min: 0, max: Infinity },
  { label: 'Hasta €100', min: 0, max: 100 },
  { label: '€100 – €250', min: 100, max: 250 },
  { label: '€250 – €500', min: 250, max: 500 },
  { label: 'Más de €500', min: 500, max: Infinity },
]

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Precio: menor a mayor', value: 'price-asc' },
  { label: 'Precio: mayor a menor', value: 'price-desc' },
  { label: 'Nombre A–Z', value: 'name-asc' },
]

export default function CatalogoClient({ products, vendors }: Props) {
  const searchParams = useSearchParams()
  const initialVendor = searchParams.get('vendor') ?? 'all'

  const [search, setSearch] = useState('')
  const [vendor, setVendor] = useState(initialVendor)
  const [priceRange, setPriceRange] = useState(0)
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q)
      )
    }

    if (vendor !== 'all') {
      result = result.filter((p) => p.vendor === vendor)
    }

    const range = PRICE_RANGES[priceRange]
    result = result.filter((p) => p.price >= range.min && p.price <= range.max)

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [products, search, vendor, priceRange, sort])

  const hasActiveFilters = search || vendor !== 'all' || priceRange !== 0

  function resetFilters() {
    setSearch('')
    setVendor('all')
    setPriceRange(0)
    setSort('newest')
  }

  return (
    <main className="min-h-screen pt-28 pb-24 bg-dark-950">
      <div className="container-luxury">
        {/* Header */}
        <div className="mb-12">
          <p className="section-subtitle mb-4">Colección completa</p>
          <h1 className="section-title">Catálogo</h1>
        </div>

        {/* Search + Controls bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-900 border border-white/5 text-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-dark-600"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-dark-900 border border-white/5 text-dark-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 transition-colors appearance-none cursor-pointer min-w-[200px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Filters toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 border border-white/10 px-4 py-3 text-sm text-dark-300 hover:text-white hover:border-gold-500/50 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-gold-500" />
            )}
          </button>
        </div>

        <div className="flex gap-10">
          {/* Sidebar filters */}
          <aside
            className={`${
              filtersOpen ? 'block' : 'hidden'
            } md:block w-full md:w-56 shrink-0`}
          >
            <div className="space-y-8 sticky top-28">
              {/* Brand filter */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-4">Marca</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setVendor('all')}
                      className={`text-sm transition-colors ${
                        vendor === 'all' ? 'text-gold-400' : 'text-dark-400 hover:text-white'
                      }`}
                    >
                      Todas las marcas
                    </button>
                  </li>
                  {vendors.map((v) => (
                    <li key={v}>
                      <button
                        onClick={() => setVendor(v)}
                        className={`text-sm transition-colors text-left ${
                          vendor === v ? 'text-gold-400' : 'text-dark-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price filter */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-dark-400 mb-4">Precio</p>
                <ul className="space-y-2">
                  {PRICE_RANGES.map((range, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setPriceRange(i)}
                        className={`text-sm transition-colors ${
                          priceRange === i ? 'text-gold-400' : 'text-dark-400 hover:text-white'
                        }`}
                      >
                        {range.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-xs text-dark-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
                >
                  <X size={12} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-dark-500 text-xs tracking-widest uppercase">
                {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                    >
                      <ProductCard
                        handle={product.handle}
                        title={product.title}
                        vendor={product.vendor}
                        price={product.price}
                        imageSrc={product.imageSrc}
                        compareAtPrice={product.compareAtPrice}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 border border-white/5"
                >
                  <p className="font-serif text-3xl text-dark-700 mb-3">Sin resultados</p>
                  <p className="text-dark-500 text-sm mb-6">
                    No hay productos que coincidan con los filtros actuales.
                  </p>
                  <button onClick={resetFilters} className="btn-outline text-xs">
                    Ver todo el catálogo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
