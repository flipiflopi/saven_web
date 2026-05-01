import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center px-6">
        <p className="section-subtitle mb-6">Error 404</p>
        <h1 className="font-serif text-5xl text-white font-light mb-6">
          Producto no encontrado
        </h1>
        <p className="text-dark-400 font-light mb-10 max-w-sm mx-auto">
          Este producto no existe o ha sido eliminado del catálogo.
        </p>
        <Link href="/catalogo" className="btn-primary">
          Ver el catálogo completo
        </Link>
      </div>
    </main>
  )
}
