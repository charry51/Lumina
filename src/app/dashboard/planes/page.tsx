import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PlanesPage() {
  const supabase = await createClient()
  
  // Obtener planes
  const { data: planes } = await supabase
    .from('planes')
    .select('*')
    .order('precio_mensual', { ascending: true })

  // Obtener plan actual del usuario
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('perfiles')
    .select('plan_id')
    .eq('id', user?.id)
    .single()

  return (
    <div className="p-8 min-h-screen bg-background text-foreground font-sans">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-heading uppercase tracking-tighter text-zinc-100 mb-4">Planes de Emisión</h1>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-[3px] max-w-2xl mx-auto">
          Potencia tus pantallas con la mejor estrategia de contenidos.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {planes?.map((plan) => (
          <div key={plan.id} className={`cyber-card p-6 flex flex-col transition-all relative ${
            profile?.plan_id === plan.id ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''
          }`}>
            {profile?.plan_id === plan.id && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
                <span className="bg-primary text-black text-[9px] uppercase font-black px-4 py-1.5 rounded-full tracking-[2px] shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                  Tu Plan Actual
                </span>
              </div>
            )}

            {plan.id === 'presencia' && profile?.plan_id !== 'presencia' && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
                <span className="bg-[#FFD700] text-black text-[10px] uppercase font-black px-5 py-2 rounded-full tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.4)] border border-white/20 animate-bounce">
                   🎁 ¡30 DÍAS GRATIS!
                </span>
              </div>
            )}
            
            <div className="mb-6 pt-4">
              <h3 className="text-xl font-heading text-zinc-100 uppercase mb-2 tracking-tight">{plan.nombre}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-mono font-bold text-primary">{plan.precio_mensual}€</span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">/ mensual</span>
              </div>
            </div>

            <div className="flex-1 mb-8">
              <ul className="space-y-3 text-[11px] font-mono uppercase tracking-tight text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,210,255,0.8)]"></span>
                  {plan.max_pantallas} Nodos de pantalla
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-50"></span>
                  {plan.max_campanas} Campañas simultáneas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-50"></span>
                  Slots de {plan.max_duracion_segundos}s
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Prioridad {plan.prioridad}
                </li>
              </ul>
            </div>

            <div className="mt-auto">
              {profile?.plan_id === plan.id ? (
                <button className="w-full py-3 text-[10px] uppercase font-black tracking-widest border border-zinc-800 text-zinc-600 cursor-not-allowed">
                  Tu Plan Actual
                </button>
              ) : (
                <Link href={`/dashboard/planes/checkout?plan=${plan.id}`} className="w-full">
                  <button className="cyber-button-cyan w-full text-[11px] font-black uppercase tracking-[2px]">
                    Contratar Plan
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
