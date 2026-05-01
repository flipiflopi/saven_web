'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Colección', href: '/#coleccion' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Sobre SAVEN', href: '/#sobre' },
  { label: 'Contacto', href: '/#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-dark-950/95 backdrop-blur-sm border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container-luxury flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.3em] text-white hover:text-gold-400 transition-colors"
          >
            SAVEN
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[0.2em] uppercase text-dark-200 hover:text-gold-400 transition-colors font-sans"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart + Mobile toggle */}
          <div className="flex items-center gap-6">
            <Link href="/carrito" className="relative group">
              <ShoppingBag
                size={20}
                className="text-dark-200 group-hover:text-gold-400 transition-colors"
              />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-dark-950 text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-dark-200 hover:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-dark-950 flex flex-col"
          >
            <div className="container-luxury flex items-center justify-between h-20">
              <Link
                href="/"
                className="font-serif text-2xl tracking-[0.3em] text-white"
                onClick={() => setMobileOpen(false)}
              >
                SAVEN
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-dark-200 hover:text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col items-center justify-center flex-1 gap-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className="font-serif text-3xl text-white hover:text-gold-400 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
