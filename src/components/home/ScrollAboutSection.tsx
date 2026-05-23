'use client'

import { useEffect, useRef } from 'react'

const START    = 0
const TOTAL    = 120   // frames 0000–0119
const PX_FRAME = 10
const LERP     = 0.14

export default function ScrollAboutSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const posterRef   = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const frames: HTMLImageElement[] = new Array(TOTAL)
    const loaded = new Uint8Array(TOTAL)
    let loadedCount  = 0
    let animReady    = false
    let targetFrame  = 0
    let displayFrame = 0
    let sectionTop   = 0
    let rafId: number

    // Calcula posición absoluta de la sección respecto al documento
    function computeSectionTop() {
      const section = sectionRef.current
      if (!section) return
      sectionTop = window.scrollY + section.getBoundingClientRect().top
    }

    function safeFrame(f: number): number {
      let i = Math.min(Math.round(f), TOTAL - 1)
      while (i > 0 && !loaded[i]) i--
      return i
    }

    function drawBlended(f: number) {
      const i0    = safeFrame(f)
      const i1    = Math.min(i0 + 1, TOTAL - 1)
      const alpha = f - Math.floor(f)
      ctx.drawImage(frames[i0], 0, 0, 800, 800)
      if (alpha > 0.003 && loaded[i1]) {
        ctx.globalAlpha = alpha
        ctx.drawImage(frames[i1], 0, 0, 800, 800)
        ctx.globalAlpha = 1
      }
    }

    function onScroll() {
      const section = sectionRef.current
      if (!section) return
      const scrolled = window.scrollY - sectionTop
      const travel   = section.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrolled / travel))
      targetFrame    = progress * (TOTAL - 1)
    }

    function tick() {
      rafId = requestAnimationFrame(tick)
      if (!animReady) return
      const delta = targetFrame - displayFrame
      displayFrame = Math.abs(delta) < 0.005 ? targetFrame : displayFrame + delta * LERP
      drawBlended(displayFrame)
    }

    function onFrameLoaded(i: number) {
      loaded[i] = 1
      loadedCount++

      if (progressRef.current)
        progressRef.current.style.width = (loadedCount / TOTAL * 100).toFixed(1) + '%'

      if (i === 0 && !animReady) {
        animReady = true
        drawBlended(0)
        if (posterRef.current) posterRef.current.style.opacity = '0'
      }

      if (loadedCount === TOTAL && progressRef.current)
        progressRef.current.style.opacity = '0'
    }

    for (let i = 0; i < TOTAL; i++) {
      const img = new Image()
      const idx = i
      img.onload  = () => onFrameLoaded(idx)
      img.onerror = () => { loadedCount++ }
      img.src = '/frames-about/' + String(START + i).padStart(4, '0') + '.webp'
      frames[i] = img
    }

    // Esperar a que el layout esté pintado antes de medir la posición
    requestAnimationFrame(() => {
      computeSectionTop()
      onScroll()
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', computeSectionTop)
    tick()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', computeSectionTop)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative', height: `calc(100vh + ${TOTAL * PX_FRAME}px)` }}
    >
      {/* Barra de carga */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2, zIndex: 10, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div
          ref={progressRef}
          style={{
            height: '100%', width: '0%',
            background: 'rgba(212,150,31,0.8)',
            transition: 'width 0.15s linear, opacity 0.6s ease',
          }}
        />
      </div>

      {/* Sticky — texto + canvas juntos */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        background: '#030303',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%', maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }}>

          {/* Texto — estático */}
          <div>
            <p style={{
              fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: '#d4961f', marginBottom: 24,
            }}>
              Sobre SAVEN
            </p>

            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 300, color: '#fff', lineHeight: 1.15, margin: '0 0 28px',
            }}>
              Tiempo que<br />
              <em style={{ color: '#d4961f', fontStyle: 'normal' }}>perdura.</em>
            </h2>

            <div style={{ color: '#999', fontSize: 14, lineHeight: 1.9, fontWeight: 300 }}>
              <p style={{ marginBottom: 16 }}>
                SAVEN nació de una obsesión por lo atemporal. Cada reloj que llevamos es
                una declaración silenciosa de quiénes somos y de lo que valoramos.
              </p>
              <p style={{ marginBottom: 16 }}>
                Nuestra colección combina diseño propio de alta relojería con piezas
                seleccionadas de las marcas más respetadas del sector. Cada pieza pasa
                por un riguroso proceso de selección antes de llegar a nuestro catálogo.
              </p>
              <p>
                No vendemos relojes. Ofrecemos instrumentos de precisión que acompañan
                los momentos que importan.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 48, marginTop: 40 }}>
              {[
                { num: '2+',   label: 'Marcas exclusivas' },
                { num: '100%', label: 'Autenticidad garantizada' },
                { num: '∞',    label: 'Garantía de servicio' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#d4961f', margin: '0 0 4px' }}>
                    {s.num}
                  </p>
                  <p style={{ fontSize: 10, color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas — animación scroll */}
          <div style={{ position: 'relative', width: 'min(45vw, 560px)', height: 'min(45vw, 560px)', margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={posterRef}
              src="/frames-about/0000.webp"
              alt=""
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'contain',
                transition: 'opacity 0.3s ease',
                zIndex: 1,
              }}
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                zIndex: 2,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
