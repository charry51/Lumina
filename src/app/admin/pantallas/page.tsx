import { createClient } from '@/lib/supabase/server'
import { PantallasTable } from './PantallasTable'
import { NuevaPantallaForm } from './NuevaPantallaForm'

export default async function AdminPantallasPage() {
  const supabase = await createClient()

  // Leer pantallas con datos de Yield Management
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('*, precio_emision, precio_base, capacidad_maxima')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Red de Pantallas</h1>
          <p className="text-zinc-500">Gestión de inventario físico y ubicaciones.</p>
        </div>
        <NuevaPantallaForm />
      </header>

      {error ? (
        <div className="p-4 bg-red-900/50 text-red-400 border border-red-800 rounded-lg">
          Error al cargar inventario: {error.message}
        </div>
      ) : (
        <PantallasTable initialData={pantallas || []} />
      )}
    </div>
  )
}
