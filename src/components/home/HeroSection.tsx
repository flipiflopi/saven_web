'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

type Props = {
  videoSrc?: string
}

export default function HeroSection({ videoSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-700 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-dark-950/60" />

      {/* Content — CSS animations, no JS dependency */}
      <div className="relative z-10 text-center px-6">
        <p className="section-subtitle mb-8 hero-subtitle">
          Alta Relojería
        </p>

        <h1 className="font-serif text-7xl md:text-9xl lg:text-[11rem] font-light tracking-[0.15em] text-white leading-none mb-8 hero-title">
          SAVEN
        </h1>

        <p className="text-dark-300 font-light text-sm md:text-base tracking-[0.2em] uppercase mb-12 max-w-sm mx-auto hero-tagline">
          El tiempo como arte
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center hero-cta">
          <Link href="/#coleccion" className="btn-primary">
            Explorar Colección
          </Link>
          <Link href="/catalogo" className="btn-outline">
            Ver Catálogo
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 hero-scroll">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown size={16} className="hero-scroll-bounce" />
      </div>
    </section>
  )
}
