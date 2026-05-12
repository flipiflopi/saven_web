import { Resend } from 'resend'
import { getShippingZone } from './shipping'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const OWNER = process.env.OWNER_EMAIL ?? ''

type OrderItem = {
  title: string
  variantTitle?: string | null
  sku?: string | null
  price: number
  quantity: number
}

type Address = {
  line1: string
  city: string
  postalCode: string
  country: string
  countryName: string
  phone?: string
}

type EmailOrderData = {
  orderId: string
  paypalId: string
  name: string
  email: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  address: Address
  createdAt: Date
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function customerHtml(d: EmailOrderData): string {
  const rows = d.items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">
        ${i.title}${i.variantTitle && i.variantTitle !== 'Default Title' ? `<br><span style="color:#888;font-size:12px;">${i.variantTitle}</span>` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:14px;text-align:center;">×${i.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;color:#d4961f;font-size:14px;text-align:right;">${fmt(i.price * i.quantity)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-size:28px;letter-spacing:10px;color:#fff;margin:0 0 6px;">SAVEN</h1>
    <p style="font-size:10px;letter-spacing:4px;color:#d4961f;text-transform:uppercase;margin:0;">Alta Relojería</p>
  </div>

  <!-- Divider -->
  <div style="border-top:1px solid #222;margin-bottom:32px;"></div>

  <!-- Greeting -->
  <h2 style="font-size:22px;font-weight:normal;color:#fff;margin:0 0 12px;">Gracias por tu pedido, ${d.name.split(' ')[0]}.</h2>
  <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 32px;">
    Hemos recibido tu pedido correctamente. En cuanto lo preparemos recibirás una notificación de envío.
    El plazo de entrega estimado es de <strong style="color:#fff;">7–14 días laborables</strong>.
  </p>

  <!-- Order number -->
  <div style="background:#111;border:1px solid #1e1e1e;padding:16px 20px;margin-bottom:32px;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;">Número de pedido</p>
    <p style="margin:6px 0 0;font-size:14px;color:#d4961f;font-family:monospace;">#${d.orderId.slice(-8).toUpperCase()}</p>
  </div>

  <!-- Products -->
  <h3 style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 16px;">Productos</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    ${rows}
  </table>

  <!-- Totals -->
  <div style="border-top:1px solid #222;padding-top:16px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="color:#888;font-size:14px;">Subtotal</span>
      <span style="color:#fff;font-size:14px;">${fmt(d.subtotal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
      <span style="color:#888;font-size:14px;">Envío — ${getShippingZone(d.address.country)}</span>
      <span style="color:#fff;font-size:14px;">${d.shipping === 0 ? 'Gratis' : fmt(d.shipping)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;border-top:1px solid #333;padding-top:12px;">
      <span style="color:#fff;font-size:16px;font-weight:bold;">Total</span>
      <span style="color:#d4961f;font-size:16px;">${fmt(d.total)}</span>
    </div>
  </div>

  <!-- Shipping address -->
  <h3 style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 12px;">Dirección de envío</h3>
  <div style="background:#111;border:1px solid #1e1e1e;padding:16px 20px;margin-bottom:40px;">
    <p style="margin:0;color:#fff;font-size:14px;line-height:1.8;">
      ${d.name}<br>
      ${d.address.line1}<br>
      ${d.address.postalCode} ${d.address.city}<br>
      ${d.address.countryName}
      ${d.address.phone ? `<br>${d.address.phone}` : ''}
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
    <p style="color:#555;font-size:12px;line-height:1.8;margin:0;">
      Si tienes alguna pregunta sobre tu pedido, escríbenos a<br>
      <a href="mailto:${OWNER}" style="color:#d4961f;text-decoration:none;">${OWNER}</a>
    </p>
    <p style="color:#333;font-size:11px;margin:16px 0 0;letter-spacing:2px;">SAVEN © ${new Date().getFullYear()}</p>
  </div>

</div>
</body>
</html>`
}

function ownerText(d: EmailOrderData): string {
  const zone = getShippingZone(d.address.country)
  const lines = [
    `NUEVO PEDIDO SAVEN`,
    `═══════════════════════════════════════`,
    ``,
    `Pedido:    #${d.orderId.slice(-8).toUpperCase()}`,
    `PayPal ID: ${d.paypalId}`,
    `Fecha:     ${d.createdAt.toLocaleString('es-ES')}`,
    ``,
    `── CLIENTE ─────────────────────────────`,
    `Nombre:    ${d.name}`,
    `Email:     ${d.email}`,
    d.address.phone ? `Teléfono:  ${d.address.phone}` : '',
    ``,
    `── DIRECCIÓN DE ENVÍO ───────────────────`,
    `${d.address.line1}`,
    `${d.address.postalCode} ${d.address.city}`,
    `${d.address.countryName} (${d.address.country})`,
    `Zona:      ${zone}`,
    ``,
    `── PRODUCTOS ────────────────────────────`,
    ...d.items.map(i =>
      `• ${i.title}${i.variantTitle && i.variantTitle !== 'Default Title' ? ` — ${i.variantTitle}` : ''}` +
      `${i.sku ? ` [${i.sku}]` : ''} × ${i.quantity}  →  ${fmt(i.price * i.quantity)}`
    ),
    ``,
    `── IMPORTES ─────────────────────────────`,
    `Subtotal:  ${fmt(d.subtotal)}`,
    `Envío:     ${d.shipping === 0 ? 'Gratis' : fmt(d.shipping)}`,
    `TOTAL:     ${fmt(d.total)}`,
    ``,
    `═══════════════════════════════════════`,
  ].filter(l => l !== undefined)

  return lines.join('\n')
}

type TrackingEmailData = {
  orderId: string
  name: string
  email: string
  trackingNumber: string
  items: OrderItem[]
  address: Address
}

function trackingHtml(d: TrackingEmailData): string {
  const trackingUrl = `https://www.correos.es/es/es/herramientas/localizador/envios?tracking-number=${encodeURIComponent(d.trackingNumber)}`
  const rows = d.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">
        ${i.title}${i.variantTitle && i.variantTitle !== 'Default Title' ? `<br><span style="color:#888;font-size:12px;">${i.variantTitle}</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:14px;text-align:right;">×${i.quantity}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">

  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-size:28px;letter-spacing:10px;color:#fff;margin:0 0 6px;">SAVEN</h1>
    <p style="font-size:10px;letter-spacing:4px;color:#d4961f;text-transform:uppercase;margin:0;">Alta Relojería</p>
  </div>

  <div style="border-top:1px solid #222;margin-bottom:32px;"></div>

  <h2 style="font-size:22px;font-weight:normal;color:#fff;margin:0 0 12px;">
    Hola ${d.name.split(' ')[0]}, tu pedido está en camino.
  </h2>
  <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 32px;">
    Tu pedido <strong style="color:#fff;">#${d.orderId.slice(-8).toUpperCase()}</strong> ha sido enviado y ya está en tránsito.
  </p>

  <!-- Tracking number -->
  <div style="background:#111;border:1px solid #d4961f33;padding:24px;margin-bottom:24px;text-align:center;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;">Número de seguimiento</p>
    <p style="margin:0 0 20px;font-size:22px;color:#d4961f;font-family:monospace;letter-spacing:2px;">${d.trackingNumber}</p>
    <a href="${trackingUrl}" style="display:inline-block;background:#d4961f;color:#000;padding:12px 28px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;">
      Rastrear envío en Correos
    </a>
  </div>

  <p style="color:#555;font-size:12px;text-align:center;margin:0 0 32px;">
    Si el botón no funciona, busca tu envío en correos.es con el número:<br>
    <strong style="color:#888;">${d.trackingNumber}</strong>
  </p>

  <!-- Products -->
  <h3 style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 12px;">Productos enviados</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${rows}</table>

  <!-- Address -->
  <h3 style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 12px;">Dirección de entrega</h3>
  <div style="background:#111;border:1px solid #1e1e1e;padding:16px 20px;margin-bottom:40px;">
    <p style="margin:0;color:#fff;font-size:14px;line-height:1.8;">
      ${d.name}<br>${d.address.line1}<br>
      ${d.address.postalCode} ${d.address.city}<br>${d.address.countryName}
    </p>
  </div>

  <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
    <p style="color:#555;font-size:12px;line-height:1.8;margin:0;">
      ¿Alguna pregunta? Escríbenos a
      <a href="mailto:${OWNER}" style="color:#d4961f;text-decoration:none;">${OWNER}</a>
    </p>
    <p style="color:#333;font-size:11px;margin:16px 0 0;letter-spacing:2px;">SAVEN © ${new Date().getFullYear()}</p>
  </div>
</div>
</body>
</html>`
}

export async function sendTrackingEmail(data: TrackingEmailData) {
  if (!resend) {
    console.warn('[emails] RESEND_API_KEY no configurado — email de tracking omitido')
    return
  }
  await resend.emails.send({
    from: `SAVEN <${FROM}>`,
    to: [data.email],
    subject: `Tu pedido SAVEN #${data.orderId.slice(-8).toUpperCase()} está en camino`,
    html: trackingHtml(data),
  })
}

export async function sendOrderEmails(data: EmailOrderData) {
  if (!resend) {
    console.warn('[emails] RESEND_API_KEY no configurado — emails omitidos')
    return
  }
  if (!data.email) return

  await Promise.allSettled([
    // Email al cliente
    resend.emails.send({
      from: `SAVEN <${FROM}>`,
      to: [data.email],
      subject: `Pedido confirmado — SAVEN #${data.orderId.slice(-8).toUpperCase()}`,
      html: customerHtml(data),
    }),
    // Email al propietario
    ...(OWNER ? [resend.emails.send({
      from: `SAVEN <${FROM}>`,
      to: [OWNER],
      subject: `🛍 Nuevo pedido SAVEN #${data.orderId.slice(-8).toUpperCase()} — ${data.name}`,
      text: ownerText(data),
    })] : []),
  ])
}
