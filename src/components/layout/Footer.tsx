import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-950 py-16">
      <div className="container-luxury">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-serif text-2xl tracking-[0.3em] text-white mb-4">SAVEN</p>
            <p className="text-dark-400 text-sm font-light leading-relaxed max-w-xs">
              Alta relojería para quienes entienden que el tiempo es el único lujo verdadero.
            </p>
          </div>

          <div>
            <p className="section-subtitle mb-6">Navegación</p>
            <ul className="space-y-3">
              {[
                { label: 'Colección', href: '/#coleccion' },
                { label: 'Catálogo completo', href: '/catalogo' },
                { label: 'Sobre SAVEN', href: '/#sobre' },
                { label: 'Contacto', href: '/#contacto' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-dark-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-subtitle mb-6">Contacto</p>
            <ul className="space-y-3 text-dark-400 text-sm">
              <li>info@savenwatches.com</li>
              <li>Instagram: @savenwatches</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} SAVEN. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="text-dark-500 hover:text-dark-300 text-xs uppercase tracking-widest transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-dark-500 hover:text-dark-300 text-xs uppercase tracking-widest transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
