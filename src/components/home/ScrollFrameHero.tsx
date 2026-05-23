'use client'

import { useEffect, useRef } from 'react'

const START    = 25
const TOTAL    = 192 - START   // 167 frames (25→191)
const BG       = '#020202'
const PX_FRAME = 12
const LERP     = 0.14

export default function ScrollFrameHero() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const heroRef     = useRef<HTMLElement>(null)
  const barRef      = useRef<HTMLDivElement>(null)
  const hintRef     = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const posterRef   = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    ctx.clearRect(0, 0, 800, 800)

    const frames: HTMLImageElement[] = new Array(TOTAL)
    const loaded = new Uint8Array(TOTAL)
    let loadedCount  = 0
    let animReady    = false
    let targetFrame  = 0
    let displayFrame = 0
    let rafId: number

    function safeFrame(f: number): number {
      let i = Math.min(Math.round(f), TOTAL - 1)
      while (i > 0 && !loaded[i]) i--
      return i
    }

    function drawBlended(f: number) {
      if (!ctx) return
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
      const hero = heroRef.current
      if (!hero) return
      const scrolled = window.scrollY - hero.offsetTop
      const travel   = hero.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrolled / travel))

      targetFrame = progress * (TOTAL - 1)

      if (barRef.current)
        barRef.current.style.width = (progress * 100).toFixed(1) + '%'
      if (hintRef.current)
        hintRef.current.style.opacity = progress > 0.03 ? '0' : '1'
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

      // Arrancar la animación en cuanto el frame 0 está listo
      if (i === 0 && !animReady) {
        animReady = true
        drawBlended(0)
        // Ocultar el poster — el canvas ya tiene el primer frame
        if (posterRef.current) posterRef.current.style.opacity = '0'
      }

      if (loadedCount === TOTAL && progressRef.current) {
        progressRef.current.style.opacity = '0'
      }
    }

    // Cargar en orden 0→191 para que los primeros frames lleguen antes
    for (let i = 0; i < TOTAL; i++) {
      const img = new Image()
      const idx = i
      img.onload  = () => onFrameLoaded(idx)
      img.onerror = () => { loadedCount++ }
      img.src = '/frames/' + String(START + i).padStart(4, '0') + '.webp'
      frames[i] = img
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    tick()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Barra dorada de progreso de carga (no bloquea nada) */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 2, zIndex: 999, pointerEvents: 'none',
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

      <section
        ref={heroRef}
        style={{ position: 'relative', height: `calc(100vh + ${TOTAL * PX_FRAME}px)` }}
      >
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          overflow: 'hidden', background: BG,
        }}>
          {/* Poster: se ve inmediatamente mientras el canvas carga */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={posterRef}
            src="/frames/0025.webp"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(100vw, 100vh)',
              height: 'max(100vw, 100vh)',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
            }}
          />

          <canvas
            ref={canvasRef}
            width={800}
            height={800}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width:  'max(100vw, 100vh)',
              height: 'max(100vw, 100vh)',
            }}
          />

          <div
            ref={hintRef}
            style={{
              position: 'absolute', bottom: 44, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              transition: 'opacity 0.5s ease',
            }}
          >
            <span style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
              Scroll
            </span>
            <div style={{
              width: 14, height: 14,
              borderRight: '1px solid rgba(255,255,255,0.28)',
              borderBottom: '1px solid rgba(255,255,255,0.28)',
              transform: 'rotate(45deg)',
              animation: 'bob 1.6s ease-in-out infinite',
            }} />
          </div>

          <div style={{
            position: 'absolute', bottom: 28, left: '50%',
            transform: 'translateX(-50%)',
            width: 100, height: 1, background: 'rgba(255,255,255,0.08)',
          }}>
            <div ref={barRef} style={{ height: '100%', background: 'rgba(255,255,255,0.55)', width: '0%' }} />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bob {
          0%,100% { transform: rotate(45deg) translateY(0);   opacity: 0.4; }
          50%      { transform: rotate(45deg) translateY(5px); opacity: 0.9; }
        }
      `}</style>
    </>
  )
}
