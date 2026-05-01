export default function AboutSection() {
  return (
    <section id="sobre" className="py-32 bg-dark-950">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <div>
            <p className="section-subtitle mb-6">Sobre SAVEN</p>

            <h2 className="section-title mb-8">
              Tiempo que<br />
              <em className="text-gold-400 not-italic">perdura.</em>
            </h2>

            <div className="space-y-5 text-dark-300 font-light leading-relaxed text-sm md:text-base">
              <p>
                SAVEN nació de una obsesión por lo atemporal. Cada reloj que llevamos es
                una declaración silenciosa de quiénes somos y de lo que valoramos.
              </p>
              <p>
                Nuestra colección combina diseño propio de alta relojería con piezas
                seleccionadas de las marcas más respetadas del sector. Cada pieza pasa
                por un riguroso proceso de selección antes de llegar a nuestro catálogo.
              </p>
              <p>
                No vendemos relojes. Ofrecemos instrumentos de precisión que acompañan
                los momentos que importan.
              </p>
            </div>

            <div className="flex gap-12 mt-10">
              {[
                { num: '2+', label: 'Marcas exclusivas' },
                { num: '100%', label: 'Autenticidad garantizada' },
                { num: '∞', label: 'Garantía de servicio' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl text-gold-400 mb-1">{stat.num}</p>
                  <p className="text-dark-500 text-xs tracking-widest uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative">
            <div className="aspect-[3/4] bg-dark-900 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-gold-500 to-transparent opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-serif text-8xl tracking-[0.3em] text-dark-800">S</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold-500/20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
