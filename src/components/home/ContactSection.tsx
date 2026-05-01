'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    await new Promise((r) => setTimeout(r, 1000))
    setStatus('sent')
    setForm({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="py-32 bg-dark-950 border-t border-white/5">
      <div className="container-luxury max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-subtitle mb-6">Escríbenos</p>
          <h2 className="section-title mb-4">Contacto</h2>
          <p className="text-dark-400 font-light text-sm leading-relaxed">
            ¿Tienes preguntas sobre una pieza? ¿Quieres asesoramiento personalizado?
            Estamos aquí para ayudarte.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="text-center py-16 border border-gold-500/20">
            <p className="font-serif text-3xl text-gold-400 mb-3">Mensaje enviado</p>
            <p className="text-dark-400 text-sm">
              Nos pondremos en contacto contigo en menos de 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-dark-400 mb-3">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full bg-transparent border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder:text-dark-600"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-dark-400 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-transparent border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder:text-dark-600"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-dark-400 mb-3">
                Mensaje
              </label>
              <textarea
                required
                rows={5}
                value={form.mensaje}
                onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                className="w-full bg-transparent border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder:text-dark-600 resize-none"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
