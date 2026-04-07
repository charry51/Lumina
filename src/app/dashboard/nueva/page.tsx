import { createClient } from '@/lib/supabase/server'
import CampaignForm from './CampaignForm'

export default async function NuevaCampanaPage() {
  const supabase = await createClient()

  // Fetch only active screens or all screens depending on requirements.
  // For now, getting all.
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('id, nombre, ubicacion')

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-lg">
        <h1>Error cargando pantallas</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Nueva Campaña</h1>
        <p className="text-zinc-500">Sube material publicitario y prográmalo para una de tus pantallas.</p>
      </header>
      
      <div className="p-6 border border-zinc-200 rounded-xl shadow-sm bg-white">
        <CampaignForm pantallas={pantallas || []} />
      </div>
    </div>
  )
}
