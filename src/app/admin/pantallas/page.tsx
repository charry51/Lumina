import { createClient } from '@/lib/supabase/server'
import { PantallasTable } from './PantallasTable'
import { NuevaPantallaForm } from './NuevaPantallaForm'

export default async function AdminPantallasPage() {
  const supabase = await createClient()

  // Leer pantallas con datos de Host y Perfil (Email)
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('*, hosts(perfiles(nombre_empresa)), creador:perfiles!creado_por(nombre_empresa)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 uppercase tracking-tighter italic">RED DE <span className="text-[#D4AF37] NOT-italic">PANTALLAS</span></h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Gestión centralizada del inventario físico global.</p>
        </div>
        <NuevaPantallaForm />
      </header>

      {error ? (
        <div className="p-4 bg-red-900/50 text-red-400 border border-red-800 rounded-lg font-mono text-xs uppercase">
          Error de acceso a datos: {error.message}
        </div>
      ) : (
        <PantallasTable initialData={pantallas || []} />
      )}
    </div>
  )
}
