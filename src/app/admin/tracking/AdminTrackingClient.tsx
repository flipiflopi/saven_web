'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OrderItem = { title: string; variantTitle: string | null; quantity: number; price: number }
type Address   = { line1?: string; city?: string; postalCode?: string; country?: string; countryName?: string } | null
type Order = {
  id: string; status: string; createdAt: string; name: string | null; email: string | null
  total: number; shipping: number; trackingNumber: string | null; shippedAt: string | null
  address: Address; items: OrderItem[]
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function OrderCard({ order, onShipped }: { order: Order; onShipped: (id: string, tracking: string) => void }) {
  const [tracking, setTracking] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const shipped = order.status === 'shipped'

  async function handleShip() {
    if (!tracking.trim()) { setError('Introduce el número de tracking'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/ship-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, trackingNumber: tracking.trim() }),
    })
    if (res.ok) {
      onShipped(order.id, tracking.trim())
    } else {
      const d = await res.json()
      setError(d.error ?? 'Error al actualizar')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 20,
      marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${shipped ? '#38a169' : '#d4961f'}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#111' }}>
            #{order.id.slice(-8).toUpperCase()}
          </span>
          <span style={{
            marginLeft: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: shipped ? '#c6f6d5' : '#fef3c7',
            color: shipped ? '#276749' : '#92400e',
          }}>
            {shipped ? '✓ Enviado' : '⏳ Pendiente'}
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#888' }}>{fmtDate(order.createdAt)}</span>
      </div>

      {/* Cliente */}
      <div style={{ marginBottom: 10, fontSize: 14 }}>
        <strong style={{ color: '#333' }}>{order.name ?? '—'}</strong>
        {order.email && <span style={{ color: '#666', marginLeft: 8 }}>{order.email}</span>}
      </div>

      {/* Dirección */}
      {order.address && (
        <div style={{ fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.6 }}>
          {order.address.line1 && <>{order.address.line1}<br/></>}
          {order.address.postalCode} {order.address.city} — {' '}
          <strong>{order.address.countryName ?? order.address.country}</strong>
        </div>
      )}

      {/* Productos */}
      <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ fontSize: 13, color: '#444', marginBottom: i < order.items.length - 1 ? 4 : 0 }}>
            <strong>×{item.quantity}</strong> {item.title}
            {item.variantTitle && item.variantTitle !== 'Default Title' && (
              <span style={{ color: '#888' }}> — {item.variantTitle}</span>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ fontSize: 14, color: '#333', marginBottom: 14 }}>
        Total: <strong>{fmt(order.total)}</strong>
        {order.shipping > 0 && (
          <span style={{ color: '#888', fontSize: 12 }}> (envío: {fmt(order.shipping)})</span>
        )}
      </div>

      {/* Tracking — pending */}
      {!shipped && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={tracking}
              onChange={e => { setTracking(e.target.value); setError('') }}
              placeholder="Número de tracking"
              style={{
                flex: 1, minWidth: 180, padding: '9px 12px', borderRadius: 8,
                border: '1px solid #ddd', fontSize: 14, fontFamily: 'monospace',
                outline: 'none',
              }}
              onKeyDown={e => e.key === 'Enter' && handleShip()}
            />
            <button
              onClick={handleShip}
              disabled={loading}
              style={{
                padding: '9px 18px', background: '#111', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Enviando...' : 'Marcar enviado ✓'}
            </button>
          </div>
          {error && <p style={{ color: '#e53e3e', fontSize: 13, margin: '6px 0 0' }}>{error}</p>}
        </div>
      )}

      {/* Tracking — shipped */}
      {shipped && order.trackingNumber && (
        <div style={{ background: '#f0fff4', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#276749', fontWeight: 600 }}>
            Número de tracking
          </p>
          <p style={{ margin: '0 0 8px', fontFamily: 'monospace', fontSize: 15, color: '#111' }}>
            {order.trackingNumber}
          </p>
          <a
            href={`https://www.correos.es/es/es/herramientas/localizador/envios?tracking-number=${encodeURIComponent(order.trackingNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#276749' }}
          >
            Ver en Correos →
          </a>
          {order.shippedAt && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#888' }}>
              Enviado el {fmtDate(order.shippedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminTrackingClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const router = useRouter()

  const pending = orders.filter(o => o.status !== 'shipped')
  const shipped = orders.filter(o => o.status === 'shipped')

  function handleShipped(id: string, trackingNumber: string) {
    setOrders(prev => prev.map(o =>
      o.id === id
        ? { ...o, status: 'shipped', trackingNumber, shippedAt: new Date().toISOString() }
        : o
    ))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ color: '#d4961f', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>SAVEN</span>
          <span style={{ color: '#888', fontSize: 14, marginLeft: 12 }}>Panel de envíos</span>
        </div>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          Salir
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Pendientes de envío', value: pending.length, color: '#92400e', bg: '#fef3c7' },
            { label: 'Enviados', value: shipped.length, color: '#276749', bg: '#c6f6d5' },
            { label: 'Total pedidos', value: orders.length, color: '#1a365d', bg: '#bee3f8' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 20px', flex: '1', minWidth: 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending orders */}
        {pending.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              ⏳ Pendientes de envío ({pending.length})
            </h2>
            {pending.map(o => (
              <OrderCard key={o.id} order={o} onShipped={handleShipped} />
            ))}
          </>
        )}

        {pending.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: '#38a169', fontSize: 18, margin: 0 }}>✓ Todo enviado</p>
            <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>No hay pedidos pendientes</p>
          </div>
        )}

        {/* Shipped orders */}
        {shipped.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#444', margin: '28px 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>
              ✓ Enviados ({shipped.length})
            </h2>
            {shipped.map(o => (
              <OrderCard key={o.id} order={o} onShipped={handleShipped} />
            ))}
          </>
        )}

        {orders.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: 16, margin: 0 }}>No hay pedidos todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}
