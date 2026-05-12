export const EUROPE = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
  'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','SE',
  'GB','NO','CH',
])

export const FREE_SHIPPING_THRESHOLD = 140

export function getShippingCost(countryCode: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  if (countryCode === 'ES') return 4.95
  if (EUROPE.has(countryCode)) return 9.95
  return 14.95
}

export function getShippingZone(countryCode: string): string {
  if (countryCode === 'ES') return 'España'
  if (EUROPE.has(countryCode)) return 'Europa'
  return 'Resto del mundo'
}

export const COUNTRIES = [
  { code: 'ES', name: 'España' },
  // Europa
  { code: 'DE', name: 'Alemania' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CY', name: 'Chipre' },
  { code: 'HR', name: 'Croacia' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'SK', name: 'Eslovaquia' },
  { code: 'SI', name: 'Eslovenia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'FR', name: 'Francia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'HU', name: 'Hungría' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Italia' },
  { code: 'LV', name: 'Letonia' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
  { code: 'NO', name: 'Noruega' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'PL', name: 'Polonia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'RO', name: 'Rumanía' },
  { code: 'SE', name: 'Suecia' },
  { code: 'CH', name: 'Suiza' },
  // Resto del mundo
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CA', name: 'Canadá' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AE', name: 'Emiratos Árabes' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'JP', name: 'Japón' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'MX', name: 'México' },
  { code: 'PE', name: 'Perú' },
  { code: 'TR', name: 'Turquía' },
]
