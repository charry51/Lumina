import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CampaignForm from './CampaignForm'

export default async function NuevaCampanaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // FORZAR ONBOARDING
  const { data: profile } = await supabase
    .from('perfiles')
    .select('*, planes(nombre)')
    .eq('id', user?.id)
    .single()

  if (!profile?.plan_id || profile?.suscripcion_activa === false) {
     redirect('/dashboard/planes')
  }

  // Fetch only active screens or all screens depending on requirements.
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('id, nombre, ubicacion, ciudad, latitud, longitud')
    .eq('estado', 'activa')

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-lg">
        <h1>Error cargando pantallas</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Nueva Campaña</h1>
        <p className="text-zinc-500">Sube material publicitario y prográmalo para nuestra red de pantallas.</p>
        <span className="text-xs bg-[#D4AF37] text-black font-bold px-2 py-1 rounded inline-block mt-2">
            Nivel de Selección: {profile.planes.nombre}
        </span>
      </header>
      
      <div className="p-6 border border-zinc-200 rounded-xl shadow-sm bg-white">
        <CampaignForm pantallas={pantallas || []} userPlan={profile.planes.nombre} />
      </div>
    </div>
  )
}
