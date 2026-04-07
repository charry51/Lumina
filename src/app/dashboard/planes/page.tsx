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
    <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Mejora tu presencia visual</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu negocio y empieza a destacar en nuestra red de pantallas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {planes?.map((plan) => (
          <Card key={plan.id} className={`flex flex-col border-2 transition-all hover:shadow-xl ${
            profile?.plan_id === plan.id ? 'border-[#D4AF37] scale-105' : 'border-slate-200'
          }`}>
            <CardHeader>
              {profile?.plan_id === plan.id && (
                <div className="text-center mb-2">
                  <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                    Tu Plan Actual
                  </span>
                </div>
              )}
              <CardTitle className="text-2xl font-bold">{plan.nombre}</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{plan.precio_mensual}€</span>
                <span className="ml-1 text-sm font-semibold leading-6 text-slate-500">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 text-sm leading-6 text-slate-600">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Hasta {plan.max_pantallas} pantalla(s)
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {plan.max_campanas} campaña(s) activas
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Contenido de {plan.max_duracion_segundos}s máx.
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Prioridad {plan.prioridad}
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {profile?.plan_id === plan.id ? (
                <Button className="w-full" variant="secondary" disabled>
                  Seleccionado
                </Button>
              ) : (
                <Link href={`/dashboard/planes/checkout?plan=${plan.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    Elegir Plan
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
