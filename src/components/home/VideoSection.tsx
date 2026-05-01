'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

type Props = {
  videoSrc?: string
}

export default function VideoSection({ videoSrc }: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-0 bg-dark-950 overflow-hidden">
      <div className="relative w-full aspect-video max-h-[80vh]">
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay={inView}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-dark-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-px bg-gold-500 mx-auto mb-8" />
              <p className="font-serif text-5xl md:text-7xl text-dark-700 tracking-[0.2em]">SAVEN</p>
              <div className="w-16 h-px bg-gold-500 mx-auto mt-8" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-dark-950/50 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="section-subtitle mb-6">Ingeniería de precisión</p>
            <h2 className="font-serif text-4xl md:text-6xl text-white font-light leading-tight max-w-2xl mx-auto">
              Cada mecanismo cuenta<br />
              <em className="text-gold-400 not-italic">su propia historia</em>
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}
