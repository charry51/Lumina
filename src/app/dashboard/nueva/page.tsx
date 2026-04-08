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
    <div className="max-w-4xl mx-auto py-12 px-6 bg-background text-foreground min-h-screen">
      <header className="mb-8 border-b border-zinc-800 pb-6 flex items-center gap-6">
        <img src="/logo.png" alt="Lumina Logo" className="h-12 w-auto" />
        <div>
            <h1 className="text-2xl font-bold text-zinc-100 italic tracking-tight uppercase">CREAR <span className="text-[#D4AF37] NOT-italic">NUEVA CAMPAÑA</span></h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] font-bold px-3 py-1 rounded-full border border-[#D4AF37]/30 uppercase tracking-widest">
                    Modo: {profile.planes.nombre}
                </span>
            </div>
        </div>
      </header>
      
      <div className="p-8 border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950">
        <CampaignForm pantallas={pantallas || []} userPlan={profile.planes.nombre} />
      </div>
    </div>
  )
}
