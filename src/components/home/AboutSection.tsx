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

          {/* Image */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about.png"
              alt="SAVEN"
              className="max-w-[60%] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
